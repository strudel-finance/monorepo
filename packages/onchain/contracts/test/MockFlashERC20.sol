pragma solidity 0.6.6;

import {FlashERC20} from "../FlashERC20.sol";

contract MockFlashERC20 is FlashERC20 {
  constructor(
    string memory name,
    string memory symbol,
    uint256 supply
  ) public {
    _mint(msg.sender, supply);
    __Flash_init(name, symbol);
  }
}
