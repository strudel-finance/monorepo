// SPDX-License-Identifier: MPL-2.0

pragma solidity 0.6.6;

contract MockAuctionManager {
  mapping(address => bool) public isOurAuction;
  mapping(address => uint256) public lockTimeForAuction;

  function setAuction(address auction, uint256 lockTime) external {
    isOurAuction[auction] = true;
    lockTimeForAuction[auction] = lockTime;
  }
}
