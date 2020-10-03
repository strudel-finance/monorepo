pragma solidity 0.6.6;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Mintable} from "../ERC20Mintable/ERC20Mintable.sol";

contract MockERC20 is ERC20, ERC20Mintable {
  constructor(
    string memory name,
    string memory symbol,
    uint256 supply
  ) public ERC20(name, symbol) {
    _mint(msg.sender, supply);
  }
}
