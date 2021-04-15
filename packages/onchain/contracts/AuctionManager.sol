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
  uint256 public sellThreshold;
  // cap auctions at certain amount of $TRDL minted
  uint256 public dilutionBound;
  // stop selling when volume small
  uint256 public dustThreshold;
  // % start_price above estimate, and % min_price below estimate
  uint256 public priceSpan;
  // auction duration
  uint256 public auctionDuration;

  MockERC20 private strudel;
  IERC20 private vBtc;
  IPriceOracle private btcPriceOracle;
  IPriceOracle private vBtcPriceOracle;
  IPriceOracle private strudelPriceOracle;
  IDutchSwapFactory private auctionFactory;
  IDutchAuction public currentAuction;

  // Upgradability -> is this layout OK?
  mapping(address => bool) public isOurAuction;
  mapping(address => uint256) public lockTimeForAuction;
  IERC20 private auctionToken;


  constructor(
    address _strudelAddr,
    address _vBtcAddr,
    address _btcPriceOracle,
    address _vBtcPriceOracle,
    address _strudelPriceOracle,
    address _auctionFactory,
    address _auctionTokenAddr
  ) public {
    __Ownable_init();
    strudel = MockERC20(_strudelAddr);
    vBtc = IERC20(_vBtcAddr);
    btcPriceOracle = IPriceOracle(_btcPriceOracle);
    vBtcPriceOracle = IPriceOracle(_vBtcPriceOracle);
    strudelPriceOracle = IPriceOracle(_strudelPriceOracle);
    auctionFactory = IDutchSwapFactory(_auctionFactory);
    sellThreshold = 9500; // vBTC @ 95% of BTC price or above
    dilutionBound = 70; // 0.7% of $TRDL total supply
    dustThreshold = 10; // 0.1% of $TRDL total supply
    priceSpan = 2500; // 25%
    auctionDuration = 84600; // ~23,5h
    auctionToken = IERC20(_auctionTokenAddr);
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
      try currentAuction.finaliseAuction() {      
        // do nothing
      } catch Error(string memory) {
        // do nothing
      } catch (bytes memory) {
        // do nothing
      }
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
      strudelSupply.mul(dilutionBound).mul(strudelPriceInEth).div(ACCURACY),
      imbalance
    );

    // pause if imbalance below dust threshold
    if (imbalance.div(strudelPriceInEth) < strudelSupply.mul(dustThreshold).div(ACCURACY)) {
      // pause auctions
      currentAuction = IDutchAuction(address(0));
      return;
    }

    // determine what kind of auction we want
    uint256 priceRelation = btcPriceInEth.mul(ACCURACY).div(vBtcPriceInEth);
    if (priceRelation < ACCURACY.mul(ACCURACY).div(sellThreshold)) {
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
          now + auctionDuration,
          address(strudel),
          imbalance.mul(ACCURACY.add(priceSpan)).div(ACCURACY), // startPrice
          imbalance.mul(ACCURACY.sub(priceSpan)).div(ACCURACY), // minPrice
          address(this)
        )
      );
    } else {
      // calculate imbalance in $TRDL
      imbalance = imbalance.div(strudelPriceInEth);

      // PROXY: this can go away, replace with a$TRDL
      /* strudel.mint(address(this), imbalance); */
      /* strudel.approve(address(auctionFactory), imbalance); */

      
      // calculate price in vBTC
      vBtcAmount = strudelPriceInEth.mul(1e18).div(vBtcPriceInEth);
      // auction off some $TRDL
      currentAuction = IDutchAuction(
        auctionFactory.deployDutchAuction(
          address(auctionToken),
          imbalance,
          now,
          now + auctionDuration,
          address(vBtc),
          vBtcAmount.mul(ACCURACY.add(priceSpan)).div(ACCURACY), // startPrice
          vBtcAmount.mul(ACCURACY.sub(priceSpan)).div(ACCURACY), // minPrice
          address(this)
        )
      );

      isOurAuction[address(currentAuction)] = true;
      lockTimeForAuction[address(currentAuction)] = 5; // TODO: What should this be?
    }
  }

  function setSellThreshold(uint256 _threshold) external onlyOwner {
    require(_threshold >= 6000, "threshold below 60% minimum");
    require(_threshold <= 12000, "threshold above 120% maximum");
    sellThreshold = _threshold;
  }

  function setDulutionBound(uint256 _dilutionBound) external onlyOwner {
    require(_dilutionBound > dustThreshold, "dilution bound below dustThreshold");
    require(_dilutionBound <= 1000, "dilution bound above 10% max value");
    dilutionBound = _dilutionBound;
  }

  function setDustThreshold(uint256 _dustThreshold) external onlyOwner {
    require(_dustThreshold > 0, "dust threshold can not be 0");
    require(_dustThreshold < dilutionBound, "dust threshold above dilution bound");
    dustThreshold = _dustThreshold;
  }

  function setPriceSpan(uint256 _priceSpan) external onlyOwner {
    require(_priceSpan > 1000, "price span should have at least 10%");
    require(_priceSpan < ACCURACY, "price span larger accuracy");
    priceSpan = _priceSpan;
  }

  function setAuctionDuration(uint256 _auctionDuration) external onlyOwner {
    require(_auctionDuration >= 3600, "auctions should run at laest for 1 hour");
    require(_auctionDuration <= 604800, "auction duration should be less than week");
    auctionDuration = _auctionDuration;
  }

  function renounceMinter() external onlyOwner {
    strudel.renounceMinter();
  }

  function swipe(address tokenAddr) external onlyOwner {
    IERC20 token = IERC20(tokenAddr);
    token.transfer(owner(), token.balanceOf(address(this)));
  }
}
