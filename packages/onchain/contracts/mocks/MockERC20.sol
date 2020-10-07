pragma solidity 0.6.6;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20UpgradeSafe {
  constructor(
    string memory name,
    string memory symbol,
    uint256 supply
  ) public {
    _mint(msg.sender, supply);
    __ERC20_init(name, symbol);
  }
}
