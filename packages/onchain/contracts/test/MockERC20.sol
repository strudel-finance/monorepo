pragma solidity >=0.4.22 <0.8.0;


import {ERC20Detailed} from "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";


contract MockERC20 is ERC20Mintable, ERC20Detailed {
    constructor(
        string memory name,
        string memory symbol,
        uint256 supply
    ) public ERC20Detailed(name, symbol, 18) {
        _mint(msg.sender, supply);
    }
}