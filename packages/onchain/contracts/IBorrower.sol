pragma solidity ^0.6.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IBorrower {
  function executeOnFlashMint(uint256 amount) external;
}
