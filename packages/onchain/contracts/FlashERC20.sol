pragma solidity 0.6.6;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IBorrower} from "./IBorrower.sol";
import {IFlashERC20} from "./IFlashERC20.sol";

contract FlashERC20 is ERC20, Ownable, IFlashERC20 {
  uint256 constant BTC_CAP = 21 * 10**24;
  uint256 constant BORROW_THRESHOLD = 10**17; // 0.1 BTC

  // Dev fund (2%, initially)
  uint256 public devFundDivRate = 50;

  event FlashMint(address indexed src, uint256 wad, bytes32 data);

  constructor(string memory name, string memory symbol) public ERC20(name, symbol) {}

  // Allows anyone to mint tokens as long as it gets burned by the end of the transaction.
  function flashMint(uint256 amount, bytes32 data) external override {
    // check holder
    require(balanceOf(msg.sender) > BORROW_THRESHOLD, "only holders can borrow");

    // do not exceed cap
    require(totalSupply().add(amount) <= BTC_CAP, "can not borrow more than BTC cap");

    // mint tokens
    _mint(msg.sender, amount);

    // hand control to borrower
    IBorrower(msg.sender).executeOnFlashMint(amount, data);

    uint256 fee = amount.div(devFundDivRate);

    // burn tokens
    _burn(msg.sender, amount.add(fee)); // reverts if `msg.sender` does not have enough
    _mint(owner(), fee);

    emit FlashMint(msg.sender, amount, data);
  }

  function setDevFundDivRate(uint256 _devFundDivRate) public onlyOwner {
    require(_devFundDivRate > 0, "!devFundDivRate-0");
    devFundDivRate = _devFundDivRate;
  }
}
