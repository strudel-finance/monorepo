pragma solidity 0.6.6;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/Math.sol";
import "./mocks/MockERC20.sol";
import "./dutchSwap/IDutchAuction.sol";
import "./dutchSwap/IDutchSwapFactory.sol";
import "./IPriceOracle.sol";

contract AuctionManager is OwnableUpgradeSafe {
  using SafeMath for uint256;

  // used as factor when dealing with %
  uint256 constant ACCURACY = 1e4;
  // when 95% at market price, start selling
  uint256 constant SELL_THRESHOLD = 9500;
  // cap auctions at certain amount of $TRDL minted
  uint256 constant DILUTION_BOUND = 70; // 0.7% of $TRDL total supply
  // stop selling when volume small
  uint256 constant DUST_THRESHOLD = 10; // 0.1% of $TRDL total supply
  // % start_price above estimate, and % min_price below estimate
  uint256 constant PRICE_SPAN = 2500; // 25%
  // auction duration
  uint256 constant DURATION = (60 * 60 * 23) + (60 * 30); // ~23,5h

  MockERC20 private strudel;
  IERC20 private vBtc;
  IPriceOracle private btcPriceOracle;
  IPriceOracle private vBtcPriceOracle;
  IPriceOracle private strudelPriceOracle;
  IDutchSwapFactory private auctionFactory;
  IDutchAuction public currentAuction;

  constructor(
    address _strudelAddr,
    address _vBtcAddr,
    address _btcPriceOracle,
    address _vBtcPriceOracle,
    address _strudelPriceOracle,
    address _auctionFactory
  ) public {
    strudel = MockERC20(_strudelAddr);
    vBtc = IERC20(_vBtcAddr);
    btcPriceOracle = IPriceOracle(_btcPriceOracle);
    vBtcPriceOracle = IPriceOracle(_vBtcPriceOracle);
    strudelPriceOracle = IPriceOracle(_strudelPriceOracle);
    auctionFactory = IDutchSwapFactory(_auctionFactory);
  }

  function _getDiff(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a > b) {
      return a - b;
    }
    return b - a;
  }

  event Data(uint256 indexed data, uint256 indexed dataB);

  function rotateAuctions() external {
    if (address(currentAuction) != address(0)) {
      require(currentAuction.auctionEnded(), "previous auction hasn't ended");
      currentAuction.finaliseAuction();
      uint256 studelReserves = strudel.balanceOf(address(this));
      if (studelReserves > 0) {
        strudel.burn(studelReserves);
      }
    }

    // get prices
    uint256 btcPriceInEth = btcPriceOracle.consult(1e18);
    uint256 vBtcPriceInEth = vBtcPriceOracle.consult(1e18);
    uint256 strudelPriceInEth = strudelPriceOracle.consult(1e18);

    // measure outstanding supply
    uint256 vBtcOutstandingSupply = vBtc.totalSupply();
    uint256 strudelSupply = strudel.totalSupply();
    uint256 vBtcAmount = vBtc.balanceOf(address(this));
    vBtcOutstandingSupply -= vBtcAmount;

    // calculate vBTC supply imbalance in ETH
    uint256 imbalance = _getDiff(btcPriceInEth, vBtcPriceInEth).mul(vBtcOutstandingSupply);

    // cap by dillution bound
    imbalance = Math.min(
      strudelSupply.mul(DILUTION_BOUND).mul(strudelPriceInEth).div(ACCURACY),
      imbalance
    );

    // pause if imbalance below dust threshold
    if (imbalance.div(strudelPriceInEth) < strudelSupply.mul(DUST_THRESHOLD).div(ACCURACY)) {
      // pause auctions
      currentAuction = IDutchAuction(address(0));
      return;
    }

    // determine what kind of auction we want
    uint256 priceRelation = btcPriceInEth.mul(ACCURACY).div(vBtcPriceInEth);
    if (priceRelation < ACCURACY.mul(ACCURACY).div(SELL_THRESHOLD)) {
      // cap vBtcAmount by imbalance in vBTC
      vBtcAmount = Math.min(vBtcAmount, imbalance.div(vBtcPriceInEth));
      // calculate vBTC price
      imbalance = vBtcPriceInEth.mul(1e18).div(strudelPriceInEth);
      // auction off some vBTC
      vBtc.approve(address(auctionFactory), vBtcAmount);
      currentAuction = IDutchAuction(
        auctionFactory.deployDutchAuction(
          address(vBtc),
          vBtcAmount,
          now,
          now + DURATION,
          address(strudel),
          imbalance.mul(ACCURACY.add(PRICE_SPAN)).div(ACCURACY), // startPrice
          imbalance.mul(ACCURACY.sub(PRICE_SPAN)).div(ACCURACY), // minPrice
          address(this)
        )
      );
    } else {
      // auction off some $TRDL
      // calculate imbalance in $TRDL
      imbalance = imbalance.div(strudelPriceInEth);
      strudel.mint(address(this), imbalance);
      strudel.approve(address(auctionFactory), imbalance);
      // calculate price in vBTC
      vBtcAmount = strudelPriceInEth.mul(1e18).div(vBtcPriceInEth);

      currentAuction = IDutchAuction(
        auctionFactory.deployDutchAuction(
          address(strudel),
          imbalance,
          now,
          now + DURATION,
          address(vBtc),
          vBtcAmount.mul(ACCURACY.add(PRICE_SPAN)).div(ACCURACY), // startPrice
          vBtcAmount.mul(ACCURACY.sub(PRICE_SPAN)).div(ACCURACY), // minPrice
          address(this)
        )
      );
    }
  }
}
