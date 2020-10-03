// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.6.6;

// Imports
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import '@uniswap/lib/contracts/libraries/FixedPoint.sol';
import '@uniswap/lib/contracts/libraries/Babylonian.sol';
import "./uniswap/UniswapV2Library.sol";
import './uniswap/IUniswapV2Router01.sol';
import "./uniswap/IBtcPriceOracle.sol";
import "./balancer/IBFactory.sol";
import "./balancer/IBPool.sol";
import "./balancer/utils/BalancerReentrancyGuard.sol";
import "./balancer/BMath.sol";
import "./IBorrower.sol";
import "./IFlashERC20.sol";


/**
 *
 * Reference:
 * https://github.com/balancer-labs/configurable-rights-pool/blob/master/contracts/templates/ElasticSupplyPool.sol
 *
 * @title vBTC Reserve Pool.
 *
 * @dev   Extension of Balancer labs' configurable rights pool (smart-pool).
 *        The reserve pool holds liquidity to affect the peg of vBTC in the spot pool.
 *        the setWeight function is used after trades by this priviliged contract.
 *
 */
contract ReservePoolController is ERC20, BMath, IBorrower, Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  uint256 constant DEFAULT_WEIGHT = 5 * 10**18;
  // Event declarations

  // Have to redeclare in the subclass, to be emitted from this contract

  event Trade(bool indexed direction, uint256  amount);

 //  immutable (only assigned in constructor)
  IERC20 public immutable vBtc;
  IERC20 public immutable wEth;
  IUniswapV2Router01 public immutable uniRouter; // IUniswapV2Router01
  IBFactory public immutable bFactory;


  IBPool public bPool;     // IBPool
  address public oracle;   // 
  uint256 public maxVbtcWeight = 3 * DEFAULT_WEIGHT; // denormmalized, like in Balancer

  /**
   * @notice Construct a new Configurable Rights Pool (wrapper around BPool)
   * @param _bPoolFactory - the BPoolFactory used to create the underlying pool
   * @param _uniRouter - uniswap router
   */
  constructor(
     address _vBtcAddr,
     address _wEthAddr,
     address _bPoolFactory,
     IUniswapV2Router01 _uniRouter,
     address _oracle
  ) public ERC20("Strudel vBTC++", "vBTC++") {
    vBtc = IERC20(_vBtcAddr);
    wEth = IERC20(_wEthAddr);
    bFactory = IBFactory(_bPoolFactory);
    uniRouter = _uniRouter;
    oracle = _oracle;
  }


  // computes the direction and magnitude of the profit-maximizing trade
  function computeProfitMaximizingTrade(
    uint256 truePriceTokenA,
    uint256 truePriceTokenB,
    uint256 reserveA,
    uint256 reserveB
  ) pure internal returns (bool aToB, uint256 amountIn) {
    aToB = reserveA.mul(truePriceTokenB) / reserveB < truePriceTokenA;

    uint256 invariant = reserveA.mul(reserveB);

    uint256 leftSide = Babylonian.sqrt(
      invariant.mul(aToB ? truePriceTokenA : truePriceTokenB).mul(1000) /
      uint256(aToB ? truePriceTokenB : truePriceTokenA).mul(997)
    );
    uint256 rightSide = (aToB ? reserveA.mul(1000) : reserveB.mul(1000)) / 997;

    // compute the amount that must be sent to move the price to the profit-maximizing price
    amountIn = leftSide.sub(rightSide);
  }

  // External functions

  function initialize(uint256 initialSwapFee) external {
    require(address(bPool) == address(0), "already initialized");
    require(initialSwapFee >= MIN_FEE, "swap fee low");
    require(initialSwapFee <= MAX_FEE, "swap fee high");

    // To the extent possible, modify state variables before calling functions
    _mint(msg.sender, MIN_POOL_SUPPLY);

    // get price
    uint256 wEthBal = wEth.balanceOf(address(this));
    require(wEthBal > 0, "missing initial WETH bal");
    // check denorm amount
    uint256 btcPrice = IBtcPriceOracle(oracle).consult(address(wEth), wEthBal);
    require(vBtc.balanceOf(address(this)) >= btcPrice, "missing initial vBTC bal");

    // approve vBTC and weth to bpool and uni pool
    vBtc.safeApprove(address(bPool), MAX_UINT);
    vBtc.safeApprove(address(uniRouter), MAX_UINT);
    wEth.safeApprove(address(bPool), MAX_UINT);
    wEth.safeApprove(address(uniRouter), MAX_UINT);

    // deploy bpool
    bPool = bFactory.newBPool();
    bPool.bind(address(vBtc), wEthBal, DEFAULT_WEIGHT);
    bPool.bind(address(wEth), wEthBal, DEFAULT_WEIGHT);

    // set fee
    bPool.setSwapFee(initialSwapFee);
    bPool.setPublicSwap(true);
  }

  /** 
   * @notice Update the weight of a token without changing the price (or transferring tokens)
   * @dev Checks if the token's current pool balance has deviated from cached balance,
   *      if so it adjusts the token's weights proportional to the deviation.
   *      The underlying BPool enforces bounds on MIN_WEIGHTS=1e18, MAX_WEIGHT=50e18 and TOTAL_WEIGHT=50e18.
   *      NOTE: The BPool.rebind function CAN REVERT if the updated weights go beyond the enforced bounds.
   */
  function resyncWeights() external {
    // Todo: check that bPool and uniPool are set up

    // simple check for re-entrancy
    require(msg.sender == tx.origin, "caller not EOA");
    // read FEED price of BTC
    uint256 truePriceEth = 1000*10**18;
    uint256 truePriceBtc = IBtcPriceOracle(oracle).consult(address(wEth), truePriceEth);

    // true price is expressed as a ratio, so both values must be non-zero
    require(truePriceBtc != 0, "ReservePool: ZERO_PRICE");

    // deal with spot pool
    bool ethToBtc;
    uint256 tradeAmount;
    {
      // read SPOT price of vBTC      
      (uint256 reserveWeth, uint256 reserveVbtc) = UniswapV2Library.getReserves(uniRouter.factory(), address(wEth), address(vBtc));
      // how much ETH (including UNI fee) is needed to lift SPOT to FEED?
      (ethToBtc, tradeAmount) = computeProfitMaximizingTrade(
        truePriceEth, truePriceBtc,
        reserveWeth, reserveVbtc
      );
    }

    // deal with reserve pool
    uint256 vBtcToBorrow = tradeAmount;
    if (ethToBtc) {
      // calculate amount vBTC to get the needed ETH from reserve pool
      {
        uint256 tokenBalanceIn = bPool.getBalance(address(vBtc));
        uint256 tokenWeightIn = bPool.getDenormalizedWeight(address(vBtc));
        uint256 tokenBalanceOut = bPool.getBalance(address(wEth));
        uint256 tokenWeightOut = bPool.getDenormalizedWeight(address(wEth));
        uint256 swapFee = bPool.getSwapFee();
        vBtcToBorrow = calcInGivenOut(
          tokenBalanceIn,
          tokenWeightIn,
          tokenBalanceOut,
          tokenWeightOut,
          tradeAmount,  // amount of ETH we want to get out
          swapFee);  
      }
    }

    // get the loan
    IFlashERC20(address(vBtc)).flashMint(vBtcToBorrow, bytes32(uint256(ethToBtc ? 1 : 0)));
  }


  function executeOnFlashMint(uint256 amount, bytes32 data) external override {
    // check sender
    require(msg.sender == address(vBtc), "who are you?!");
    // check amount
    require(vBtc.balanceOf(address(this)) >= amount, "loan error");
    // we received a bunch of vBTC here
    // read direction, then do the trade, trust that amounts were calculated correctly
    bool ethToBtc = uint256(data) != 0;
    address tokenIn = ethToBtc ? address(wEth) : address(vBtc);
    address tokenOut = ethToBtc ? address(vBtc) : address(wEth);
    uint256 tradeAmount = amount;
    emit Trade(ethToBtc, tradeAmount);

    if (ethToBtc) { // we want to trade eth to vBTC in UNI, so let's get the ETH
      // 4. buy ETH in reserve pool with all vBTC
      (tradeAmount, ) = bPool.swapExactAmountIn( // returns uint tokenAmountOut, uint spotPriceAfter
        address(vBtc),
        amount,
        address(wEth),
        0xff, // minAmountOut
        0xff);  // maxPrice
      
    }

    // approve should have been done in constructor
    // TransferHelper.safeApprove(tokenIn, address(router), tradeAmount);

    address[] memory path = new address[](2);
    path[0] = tokenIn;
    path[1] = tokenOut;
    // 5. sell ETH in spot pool
    (uint[] memory amounts) = IUniswapV2Router01(uniRouter).swapExactTokensForTokens(
        tradeAmount,
        0, // amountOutMin: we can skip computing this number because the math is tested
        path,
        address(this),
        0xff // deadline 
    );

    if (!ethToBtc) { // we traded vBTC for ETH in uni, now let's use it
      (tradeAmount, ) = bPool.swapExactAmountIn( // returns uint tokenAmountOut, uint spotPriceAfter
        address(wEth),
        amounts[1],
        address(vBtc),
        0xff, // minAmountOut
        0xff);  // maxPrice
    }

    {
      // read uni weights
      (uint256 reserveWeth, uint256 reserveVbtc) = UniswapV2Library.getReserves(uniRouter.factory(), address(wEth), address(vBtc));
      uint256 vBtcBalance = bPool.getBalance(address(vBtc));
      uint256 wEthBalance = bPool.getBalance(address(wEth));
      // check that new weight does not exceed max weight
      uint256 newVbtcWeight = wEthBalance.mul(DEFAULT_WEIGHT).mul(reserveVbtc).div(vBtcBalance).div(reserveWeth);
      require(newVbtcWeight < maxVbtcWeight, "max weight error");
      // adjust weights so there is no arbitrage
      IBPool(bPool).rebind(address(vBtc), vBtcBalance, newVbtcWeight);
      IBPool(bPool).rebind(address(wEth), wEthBalance, reserveWeth);
    }

    // 6. repay loan 
    // TODO: don't forget that we need to pay flash loan fee
    
  }

  function setOracle(address _newOracle) public onlyOwner {
    require(_newOracle != address(0), "!oracle-0");
    oracle = _newOracle;
  }

  function setMaxVbtcWeight(uint256 _maxVbtcWeight) public onlyOwner {
    require(_maxVbtcWeight >= DEFAULT_WEIGHT / 5, "set max weight too low error");
    require(_maxVbtcWeight <= DEFAULT_WEIGHT * 9, "set max weight too high error");
    maxVbtcWeight = _maxVbtcWeight;
  }
}