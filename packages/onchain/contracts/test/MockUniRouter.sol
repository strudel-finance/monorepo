pragma solidity 0.6.6;

contract MockUniRouter {
  address uniFactory;

  function factory() external view returns (address) {
    return uniFactory;
  }

  function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external returns (uint256[] memory amounts) {
    amounts = new uint256[](2);
    amounts[0] = amountIn;
    amounts[1] = amountOutMin;
  }
}
