pragma solidity 0.6.6;

contract IFlashERC20 {

  function flashMint(uint256 amount, bytes32 data) external virtual {}

}
