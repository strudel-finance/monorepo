pragma solidity 0.6.6;

import {ERC20Mintable} from "../ERC20Mintable/ERC20Mintable.sol";
import {FlashERC20} from "../FlashERC20.sol";

contract MockFlashERC20 is FlashERC20, ERC20Mintable {
  constructor(
    string memory name,
    string memory symbol,
    uint256 supply
  ) public FlashERC20(name, symbol) {
    _mint(msg.sender, supply);
  }
}
