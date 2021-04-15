// SPDX-License-Identifier: MPL-2.0

pragma solidity 0.6.6;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "./dutchSwap/IDutchAuction.sol";
import "./GovernanceToken.sol";
import "./mocks/MockERC20.sol";
import "./AuctionManager.sol";

/// @title  Strudel Auction Token.
/// @notice This is an ERC20 contract is used as a proxy in auctions. Not a real token.
contract AuctionToken is ERC20UpgradeSafe {
  using SafeMath for uint256;

  GovernanceToken private gStrudel;
  MockERC20 private strudel;
  AuctionManager private auctionManager;

  function initialize(
                      address _gStrudel,
                      address _strudel,
                      address _auctionManager
                      ) external initializer {
    __ERC20_init("Strudel Auction Token", "a$TRDL");
    
    gStrudel = GovernanceToken(_gStrudel);
    strudel = MockERC20(_strudel);
    auctionManager = AuctionManager(_auctionManager);
  }

  // In deployDutchAuction, approve and transferFrom are called
  // In initDutchAuction, transferFrom is called again
  // In DutchAuction, transfer is called to either payout, or return money to AuctionManager

  function transferFrom(address _from, address _to, uint256 _value) public override returns (bool success) {
    return true;
  }

  function approve(address _spender, uint256 _value) public override returns (bool success) {
    return true;
  }
  
  function transfer(address to, uint256 amount) public override returns (bool success) {
    // require sender is our Auction
    address auction = _msgSender();
    require(auctionManager.isOurAuction(auction), "Caller is not our auction");

    // if recipient is AuctionManager, it means we are doing a refund -> do nothing
    if (to == address(auctionManager)) return true;
    
    uint256 blocks = auctionManager.lockTimeForAuction(auction);
    strudel.mint(address(this), amount);
    strudel.approve(address(gStrudel), amount);
    gStrudel.lock(to, amount, blocks, false);
    return true;
  }
}
