pragma solidity 0.6.6;

contract MockUniRouter {

  address uniFactory;

  function factory() external view returns (address){
    return uniFactory;
  }

  function swapExactTokensForTokens(
    uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
  ) external returns (uint[] memory amounts){
    amounts = new uint[](2);
    amounts[0] = amountIn;
    amounts[1] = amountOutMin;
  }

}