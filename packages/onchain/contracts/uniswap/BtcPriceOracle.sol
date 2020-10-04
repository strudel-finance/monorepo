pragma solidity 0.6.6;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/lib/contracts/libraries/FixedPoint.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./UniswapV2OracleLibrary.sol";
import "./UniswapV2Library.sol";

// fixed window oracle that recomputes the average price for the entire period once every period
// note that the price average is only guaranteed to be over at least 1 period, but may be over a longer period
contract BtcPriceOracle is Ownable {
  using FixedPoint for *;

  uint256 public constant PERIOD = 24 hours;

  address public immutable weth;
  address public immutable factory;

  address[] public pairs;
  mapping(address => uint256) public priceCumulativeLast;
  uint32 public blockTimestampLast;
  FixedPoint.uq112x112 public priceAverage;

  constructor(
    address _factory,
    address _weth,
    address[] memory tokenizedBtcs
  ) public {
    factory = _factory;
    weth = _weth;
    for (uint256 i = 0; i < tokenizedBtcs.length; i++) {
      _addPair(tokenizedBtcs[i], _factory, _weth);
    }
  }

  function _addPair(address tokenizedBtc, address _factory, address _weth) internal {
    // check inputs
    require(tokenizedBtc != address(0), "zero token");

    // check pair
    IUniswapV2Pair pair = IUniswapV2Pair(UniswapV2Library.pairFor(_factory, _weth, tokenizedBtc));
    require(priceCumulativeLast[address(pair)] == 0, "already known");
    uint112 reserve0;
    uint112 reserve1;
    (reserve0, reserve1, blockTimestampLast) = pair.getReserves();
    require(reserve0 != 0 && reserve1 != 0, "ExampleOracleSimple: NO_RESERVES"); // ensure that there's liquidity in the pair

    // add to storage
    priceCumulativeLast[address(pair)] = pair.price1CumulativeLast(); // fetch the current accumulated price value (0 / 1)
    pairs.push(address(pair));
  }

  function addPair(address tokenizedBtc) external onlyOwner {
    _addPair(tokenizedBtc, factory, weth);
  }

  function removePair(address tokenizedBtc) external onlyOwner {
    for (uint256 i = 0; i < pairs.length; i++) {
      address tokenAddr = IUniswapV2Pair(pairs[i]).token1();
      if (tokenAddr == tokenizedBtc) {
        priceCumulativeLast[pairs[i]] = 0;
        pairs[i] = pairs[pairs.length -1];
        pairs.pop();
        return;
      }
    }
    require(false, "remove not found");
  }

  function update() external {
    uint32 blockTimestamp;
    uint224 priceSum = 0;
    for (uint256 i = 0; i < pairs.length; i++) {
      address pair = pairs[i];
      uint256 priceCumulative;
      (, priceCumulative, blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(pair);
      uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired

      // ensure that at least one full period has passed since the last update
      require(timeElapsed >= PERIOD, "ExampleOracleSimple: PERIOD_NOT_ELAPSED");

      // overflow is desired, casting never truncates
      // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed

      priceSum += FixedPoint.uq112x112(
        uint224((priceCumulative - priceCumulativeLast[pair]) / timeElapsed)
      )._x;

      priceCumulativeLast[pair] = priceCumulative;
      
    }
    // TODO: use weights
    // TODO: use geometric
    priceAverage = FixedPoint.uq112x112(priceSum).div(uint112(pairs.length));
    blockTimestampLast = blockTimestamp;
  }

  // note this will always return 0 before update has been called successfully for the first time.
  function consult(uint256 amountIn) external view returns (uint256 amountOut) {
    return priceAverage.mul(amountIn).decode144();
  }
}
