pragma solidity 0.6.6;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IBorrower {
  function executeOnFlashMint(uint256 amount, bytes32 data) external;
}
