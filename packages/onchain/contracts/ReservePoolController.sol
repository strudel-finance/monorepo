// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.6.6;

// Imports
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/lib/contracts/libraries/Babylonian.sol";
import "./uniswap/UniswapV2Library.sol";
import "./uniswap/IUniswapV2Router01.sol";
import "./uniswap/IBtcPriceOracle.sol";
import "./balancer/IBFactory.sol";
import "./balancer/IBPool.sol";
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

  uint256 constant DEFAULT_WEIGHT = 5 * 10**18;
  // Event declarations

  // Have to redeclare in the subclass, to be emitted from this contract

  event Trade(bool indexed direction, uint256 amount);
  event LogJoin(address indexed caller, address indexed tokenIn, uint256 tokenAmountIn);

  event LogExit(address indexed caller, address indexed tokenOut, uint256 tokenAmountOut);

  //  immutable (only assigned in constructor)
  IERC20 public immutable vBtc;
  IERC20 public immutable wEth;
  IUniswapV2Router01 public immutable uniRouter; // IUniswapV2Router01
  IBFactory public immutable bFactory;

  IBPool public bPool; // IBPool
  address public oracle; //
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
  ) internal pure returns (bool aToB, uint256 amountIn) {
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

  function initialize(uint256 initialSwapFee) external onlyOwner {
    require(address(bPool) == address(0), "already initialized");

    // get price
    uint256 vBtcBal = vBtc.balanceOf(address(this));
    require(vBtcBal > 0, "missing initial vBTC bal");
    // check denorm amount
    uint256 btcInEthPrice = IBtcPriceOracle(oracle).consult(vBtcBal);
    require(wEth.balanceOf(address(this)) == btcInEthPrice, "missing initial WETH bal");

    // deploy bpool
    bPool = bFactory.newBPool();

    // approve vBTC and weth to bpool and uni pool
    vBtc.approve(address(bPool), MAX_UINT);
    vBtc.approve(address(uniRouter), MAX_UINT);
    wEth.approve(address(bPool), MAX_UINT);
    wEth.approve(address(uniRouter), MAX_UINT);

    // bind assets
    bPool.bind(address(vBtc), vBtcBal, DEFAULT_WEIGHT);
    bPool.bind(address(wEth), btcInEthPrice, DEFAULT_WEIGHT);

    // set fee, go public and issue shares
    bPool.setSwapFee(initialSwapFee);
    bPool.setPublicSwap(true);
    _mint(msg.sender, MIN_POOL_SUPPLY);
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
    // read FEED price of BTC ()
    uint256 truePriceBtc = 10**18;
    uint256 truePriceEth = IBtcPriceOracle(oracle).consult(truePriceBtc);

    // true price is expressed as a ratio, so both values must be non-zero
    require(truePriceBtc != 0, "ReservePool: ZERO_PRICE");

    // deal with spot pool
    bool ethToBtc;
    uint256 tradeAmount;
    {
      // read SPOT price of vBTC
      (uint256 reserveWeth, uint256 reserveVbtc) = UniswapV2Library.getReserves(
        uniRouter.factory(),
        address(wEth),
        address(vBtc)
      );
      // how much ETH (including UNI fee) is needed to lift SPOT to FEED?
      (ethToBtc, tradeAmount) = computeProfitMaximizingTrade(
        truePriceEth,
        truePriceBtc,
        reserveWeth,
        reserveVbtc
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
          tradeAmount, // amount of ETH we want to get out
          swapFee
        );
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

    if (ethToBtc) {
      // we want to trade eth to vBTC in UNI, so let's get the ETH
      // 4. buy ETH in reserve pool with all vBTC
      (tradeAmount, ) = bPool.swapExactAmountIn( // returns uint tokenAmountOut, uint spotPriceAfter
        address(vBtc),
        amount,
        address(wEth),
        0, // minAmountOut
        MAX_UINT
      ); // maxPrice
    }

    // approve should have been done in constructor
    // TransferHelper.safeApprove(tokenIn, address(router), tradeAmount);

    address[] memory path = new address[](2);
    path[0] = tokenIn;
    path[1] = tokenOut;
    // 5. sell ETH in spot pool
    uint256[] memory amounts = IUniswapV2Router01(uniRouter).swapExactTokensForTokens(
      tradeAmount,
      0, // amountOutMin: we can skip computing this number because the math is tested
      path,
      address(this),
      MAX_UINT // deadline
    );

    if (!ethToBtc) {
      // we traded vBTC for ETH in uni, now let's use it in balancer
      (tradeAmount, ) = bPool.swapExactAmountIn( // returns uint tokenAmountOut, uint spotPriceAfter
        address(wEth), // address tokenIn,
        amounts[1], // uint256 tokenAmountIn,
        address(vBtc), // address tokenOut,
        0, // minAmountOut
        MAX_UINT // maxPrice
      );
    }

    // adjusts weight in reserve pool
    {
      // read uni weights
      (uint256 reserveWeth, uint256 reserveVbtc) = UniswapV2Library.getReserves(
        uniRouter.factory(),
        address(wEth),
        address(vBtc)
      );
      uint256 vBtcBalance = bPool.getBalance(address(vBtc));
      uint256 wEthBalance = bPool.getBalance(address(wEth));
      // check that new weight does not exceed max weight
      uint256 newVbtcWeight = wEthBalance.mul(DEFAULT_WEIGHT).mul(reserveVbtc).div(vBtcBalance).div(
        reserveWeth
      );
      require(newVbtcWeight < maxVbtcWeight, "max weight error");
      // adjust weights so there is no arbitrage
      IBPool(bPool).rebind(address(vBtc), vBtcBalance, newVbtcWeight);
      IBPool(bPool).rebind(address(wEth), wEthBalance, DEFAULT_WEIGHT);
    }

    // 6. repay loan
    // TODO: don't forget that we need to pay a flash loan fee
  }

  function setOracle(address _newOracle) external onlyOwner {
    require(_newOracle != address(0), "!oracle-0");
    oracle = _newOracle;
  }

  function setMaxVbtcWeight(uint256 _maxVbtcWeight) external onlyOwner {
    require(_maxVbtcWeight >= DEFAULT_WEIGHT / 5, "set max weight too low error");
    require(_maxVbtcWeight <= DEFAULT_WEIGHT * 9, "set max weight too high error");
    maxVbtcWeight = _maxVbtcWeight;
  }

  /**
   * @notice Set the swap fee on the underlying pool
   * @param swapFee in Wei
   */
  function setSwapFee(uint256 swapFee) external onlyOwner {
    // Underlying pool will check against min/max fee
    bPool.setSwapFee(swapFee);
  }

  /**
   * @notice Getter for the publicSwap field on the underlying pool
   */
  function isPublicSwap() external view returns (bool) {
    return bPool.isPublicSwap();
  }

  /**
   * @notice Set the public swap flag on the underlying pool
   * @param publicSwap new value of the swap
   */
  function setPublicSwap(bool publicSwap) external onlyOwner {
    bPool.setPublicSwap(publicSwap);
  }

  /**
   * @notice Join a pool
   * @dev Emits a LogJoin event (for each token)
   *      bPool is a contract interface; function calls on it are external
   * @param poolAmountOut - number of pool tokens to receive
   * @param maxAmountsIn - Max amount of asset tokens to spend
   */
  function joinPool(uint256 poolAmountOut, uint256[] calldata maxAmountsIn) external {
    // Library computes actualAmountsIn, and does many validations
    // Cannot call the push/pull/min from an external library for
    // any of these pool functions. Since msg.sender can be anybody,
    // they must be internal
    address[] memory tokens = bPool.getCurrentTokens();

    require(maxAmountsIn.length == tokens.length, "ERR_AMOUNTS_MISMATCH");

    uint256 poolTotal = totalSupply();
    // Subtract  1 to ensure any rounding errors favor the pool
    uint256 ratio = bdiv(poolAmountOut, bsub(poolTotal, 1));

    require(ratio != 0, "ERR_MATH_APPROX");

    // We know the length of the array; initialize it, and fill it below
    // Cannot do "push" in memory
    uint256[] memory actualAmountsIn = new uint256[](tokens.length);

    // This loop contains external calls
    // External calls are to math libraries or the underlying pool, so low risk
    for (uint256 i = 0; i < tokens.length; i++) {
      address t = tokens[i];
      uint256 bal = bPool.getBalance(t);
      // Add 1 to ensure any rounding errors favor the pool
      uint256 tokenAmountIn = bmul(ratio, badd(bal, 1));

      require(tokenAmountIn != 0, "ERR_MATH_APPROX");
      require(tokenAmountIn <= maxAmountsIn[i], "ERR_LIMIT_IN");

      actualAmountsIn[i] = tokenAmountIn;
    }

    for (uint256 i = 0; i < tokens.length; i++) {
      uint256 tokenAmountIn = actualAmountsIn[i];

      emit LogJoin(msg.sender, tokens[i], tokenAmountIn);

      _pullUnderlying(tokens[i], msg.sender, tokenAmountIn);
    }

    _mint(msg.sender, poolAmountOut);
  }

  /**
   * @notice Exit a pool - redeem pool tokens for underlying assets
   * @dev Emits a LogExit event for each token
   *      bPool is a contract interface; function calls on it are external
   * @param poolAmountIn - amount of pool tokens to redeem
   * @param minAmountsOut - minimum amount of asset tokens to receive
   */
  function exitPool(uint256 poolAmountIn, uint256[] calldata minAmountsOut) external {
    address[] memory tokens = bPool.getCurrentTokens();

    require(minAmountsOut.length == tokens.length, "ERR_AMOUNTS_MISMATCH");

    uint256 ratio = bdiv(poolAmountIn, badd(totalSupply(), 1));

    uint256[] memory actualAmountsOut = new uint256[](tokens.length);

    // This loop contains external calls
    // External calls are to math libraries or the underlying pool, so low risk
    for (uint256 i = 0; i < tokens.length; i++) {
      address t = tokens[i];
      uint256 bal = bPool.getBalance(t);
      // Subtract 1 to ensure any rounding errors favor the pool
      uint256 tokenAmountOut = bmul(ratio, bsub(bal, 1));

      require(tokenAmountOut != 0, "ERR_MATH_APPROX");
      require(tokenAmountOut >= minAmountsOut[i], "ERR_LIMIT_OUT");

      actualAmountsOut[i] = tokenAmountOut;
    }

    _burn(msg.sender, poolAmountIn);

    for (uint256 i = 0; i < tokens.length; i++) {
      uint256 tokenAmountOut = actualAmountsOut[i];

      emit LogExit(msg.sender, tokens[i], tokenAmountOut);

      _pushUnderlying(tokens[i], msg.sender, tokenAmountOut);
    }
  }

  /**
   * @notice Join by swapping a fixed amount of an external token in (must be present in the pool)
   *         System calculates the pool token amount
   * @dev emits a LogJoin event
   * @param tokenIn - which token we're transferring in
   * @param tokenAmountIn - amount of deposit
   * @param minPoolAmountOut - minimum of pool tokens to receive
   * @return poolAmountOut - amount of pool tokens minted and transferred
   */
  function joinswapExternAmountIn(
    address tokenIn,
    uint256 tokenAmountIn,
    uint256 minPoolAmountOut
  ) external returns (uint256 poolAmountOut) {
    require(bPool.isBound(tokenIn), "ERR_NOT_BOUND");
    uint256 balTokenIn = bPool.getBalance(tokenIn);
    require(tokenAmountIn <= bmul(balTokenIn, MAX_IN_RATIO), "ERR_MAX_IN_RATIO");

    poolAmountOut = calcPoolOutGivenSingleIn(
      balTokenIn,
      bPool.getDenormalizedWeight(tokenIn),
      totalSupply(),
      bPool.getTotalDenormalizedWeight(),
      tokenAmountIn,
      bPool.getSwapFee()
    );

    require(poolAmountOut >= minPoolAmountOut, "ERR_LIMIT_OUT");

    emit LogJoin(msg.sender, tokenIn, tokenAmountIn);

    _mint(msg.sender, poolAmountOut);
    _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);

    return poolAmountOut;
  }

  /**
   * @notice Join by swapping an external token in (must be present in the pool)
   *         To receive an exact amount of pool tokens out. System calculates the deposit amount
   * @dev emits a LogJoin event
   * @param tokenIn - which token we're transferring in (system calculates amount required)
   * @param poolAmountOut - amount of pool tokens to be received
   * @param maxAmountIn - Maximum asset tokens that can be pulled to pay for the pool tokens
   * @return tokenAmountIn - amount of asset tokens transferred in to purchase the pool tokens
   */
  function joinswapPoolAmountOut(
    address tokenIn,
    uint256 poolAmountOut,
    uint256 maxAmountIn
  ) external returns (uint256 tokenAmountIn) {
    require(bPool.isBound(tokenIn), "ERR_NOT_BOUND");

    uint256 balTokenIn = bPool.getBalance(tokenIn);
    tokenAmountIn = calcSingleInGivenPoolOut(
      balTokenIn,
      bPool.getDenormalizedWeight(tokenIn),
      totalSupply(),
      bPool.getTotalDenormalizedWeight(),
      poolAmountOut,
      bPool.getSwapFee()
    );

    require(tokenAmountIn != 0, "ERR_MATH_APPROX");
    require(tokenAmountIn <= maxAmountIn, "ERR_LIMIT_IN");

    require(tokenAmountIn <= bmul(balTokenIn, MAX_IN_RATIO), "ERR_MAX_IN_RATIO");

    emit LogJoin(msg.sender, tokenIn, tokenAmountIn);

    _mint(msg.sender, poolAmountOut);
    _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);

    return tokenAmountIn;
  }

  /**
   * @notice Exit a pool - redeem a specific number of pool tokens for an underlying asset
   *         Asset must be present in the pool, and will incur an EXIT_FEE (if set to non-zero)
   * @dev Emits a LogExit event for the token
   * @param tokenOut - which token the caller wants to receive
   * @param poolAmountIn - amount of pool tokens to redeem
   * @param minAmountOut - minimum asset tokens to receive
   * @return tokenAmountOut - amount of asset tokens returned
   */
  function exitswapPoolAmountIn(
    address tokenOut,
    uint256 poolAmountIn,
    uint256 minAmountOut
  ) external returns (uint256 tokenAmountOut) {
    // Calculates final amountOut, and the fee and final amount in
    require(bPool.isBound(tokenOut), "ERR_NOT_BOUND");

    uint256 balTokenIn = bPool.getBalance(tokenOut);
    tokenAmountOut = calcSingleOutGivenPoolIn(
      balTokenIn,
      bPool.getDenormalizedWeight(tokenOut),
      totalSupply(),
      bPool.getTotalDenormalizedWeight(),
      poolAmountIn,
      bPool.getSwapFee()
    );

    require(tokenAmountOut >= minAmountOut, "ERR_LIMIT_OUT");
    require(tokenAmountOut <= bmul(balTokenIn, MAX_OUT_RATIO), "ERR_MAX_OUT_RATIO");

    emit LogExit(msg.sender, tokenOut, tokenAmountOut);

    _burn(msg.sender, poolAmountIn);
    _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);

    return tokenAmountOut;
  }

  /**
   * @notice Exit a pool - redeem pool tokens for a specific amount of underlying assets
   *         Asset must be present in the pool
   * @dev Emits a LogExit event for the token
   * @param tokenOut - which token the caller wants to receive
   * @param tokenAmountOut - amount of underlying asset tokens to receive
   * @param maxPoolAmountIn - maximum pool tokens to be redeemed
   * @return poolAmountIn - amount of pool tokens redeemed
   */
  function exitswapExternAmountOut(
    address tokenOut,
    uint256 tokenAmountOut,
    uint256 maxPoolAmountIn
  ) external returns (uint256 poolAmountIn) {
    require(bPool.isBound(tokenOut), "ERR_NOT_BOUND");
    uint256 balTokenIn = bPool.getBalance(tokenOut);
    require(tokenAmountOut <= bmul(balTokenIn, MAX_OUT_RATIO), "ERR_MAX_OUT_RATIO");
    poolAmountIn = calcPoolInGivenSingleOut(
      balTokenIn,
      bPool.getDenormalizedWeight(tokenOut),
      totalSupply(),
      bPool.getTotalDenormalizedWeight(),
      tokenAmountOut,
      bPool.getSwapFee()
    );

    require(poolAmountIn != 0, "ERR_MATH_APPROX");
    require(poolAmountIn <= maxPoolAmountIn, "ERR_LIMIT_IN");

    emit LogExit(msg.sender, tokenOut, tokenAmountOut);

    _burn(msg.sender, poolAmountIn);
    _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);

    return poolAmountIn;
  }

  // Rebind BPool and pull tokens from address
  // bPool is a contract interface; function calls on it are external
  function _pullUnderlying(
    address erc20,
    address from,
    uint256 amount
  ) internal {
    // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
    uint256 tokenBalance = bPool.getBalance(erc20);
    uint256 tokenWeight = bPool.getDenormalizedWeight(erc20);

    bool xfer = IERC20(erc20).transferFrom(from, address(this), amount);
    require(xfer, "ERR_ERC20_FALSE");
    bPool.rebind(erc20, badd(tokenBalance, amount), tokenWeight);
  }

  // Rebind BPool and push tokens to address
  // bPool is a contract interface; function calls on it are external
  function _pushUnderlying(
    address erc20,
    address to,
    uint256 amount
  ) internal {
    // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
    uint256 tokenBalance = bPool.getBalance(erc20);
    uint256 tokenWeight = bPool.getDenormalizedWeight(erc20);
    bPool.rebind(erc20, bsub(tokenBalance, amount), tokenWeight);

    bool xfer = IERC20(erc20).transfer(to, amount);
    require(xfer, "ERR_ERC20_FALSE");
  }
}
