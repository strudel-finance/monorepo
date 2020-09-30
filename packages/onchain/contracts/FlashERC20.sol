
pragma solidity ^0.6.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IBorrower} from "./IBorrower.sol";

contract FlashERC20 is ERC20 {

  uint256 constant BTC_CAP = 21*10**24;
  uint256 constant BORROW_THRESHOLD = 10**17; // 0.1 BTC

  address public devFund;

  event FlashMint(address indexed src, uint256 wad);

  constructor(string memory name, string memory symbol)
    ERC20(name, symbol)
  public {
  }

  // Allows anyone to mint tokens as long as it gets burned by the end of the transaction.
  function flashMint(uint256 amount) external {

    // check holder
    require(balanceOf(msg.sender) > BORROW_THRESHOLD, "only holders can borrow");

    // do not exceed cap
    require(totalSupply().add(amount) <= BTC_CAP, "can not borrow more than BTC cap");
    
    // mint tokens
    _mint(msg.sender, amount);

    // hand control to borrower
    IBorrower(msg.sender).executeOnFlashMint(amount);

    uint256 fee = amount.div(1000);

    // burn tokens
    _burn(msg.sender, amount.add(fee)); // reverts if `msg.sender` does not have enough
    _mint(devFund, fee);

    emit FlashMint(msg.sender, amount);
  }
}