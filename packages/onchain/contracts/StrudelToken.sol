// SPDX-License-Identifier: MPL

pragma solidity ^0.6.0;

import {FlashERC20} from "./FlashERC20.sol";
import {ERC20Mintable} from "./ERC20Mintable/ERC20Mintable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {ITokenRecipient} from "./ITokenRecipient.sol";

/// @title  VBTC Token.
/// @notice This is the VBTC ERC20 contract.
contract StrudelToken is FlashERC20, ERC20Mintable {
  using SafeMath for uint256;

  /// @dev Constructor, calls ERC20 constructor to set Token info
  ///      ERC20(TokenName, TokenSymbol)
  constructor() public FlashERC20("Strudel Finance", "STRDL") {
    // solhint-disable-previous-line no-empty-blocks
  }

  /// @dev             Burns an amount of the token from the given account's balance.
  ///                  deducting from the sender's allowance for said account.
  ///                  Uses the internal _burn function.
  /// @param _account  The account whose tokens will be burnt.
  /// @param _amount   The amount of tokens that will be burnt.
  function burnFrom(address _account, uint256 _amount) external {
    uint256 decreasedAllowance = allowance(_account, _msgSender()).sub(
      _amount,
      "ERC20: burn amount exceeds allowance"
    );

    _approve(_account, _msgSender(), decreasedAllowance);
    _burn(_account, _amount);
  }

  /// @dev Destroys `amount` tokens from `msg.sender`, reducing the
  /// total supply.
  /// @param _amount   The amount of tokens that will be burnt.
  function burn(uint256 _amount) external {
    _burn(msg.sender, _amount);
  }

  /// @notice           Set allowance for other address and notify.
  ///                   Allows `_spender` to spend no more than `_value`
  ///                   tokens on your behalf and then ping the contract about
  ///                   it.
  /// @dev              The `_spender` should implement the `ITokenRecipient`
  ///                   interface to receive approval notifications.
  /// @param _spender   Address of contract authorized to spend.
  /// @param _value     The max amount they can spend.
  /// @param _extraData Extra information to send to the approved contract.
  /// @return true if the `_spender` was successfully approved and acted on
  ///         the approval, false (or revert) otherwise.
  function approveAndCall(
    ITokenRecipient _spender,
    uint256 _value,
    bytes memory _extraData
  ) public returns (bool) {
    // not external to allow bytes memory parameters
    if (approve(address(_spender), _value)) {
      _spender.receiveApproval(msg.sender, _value, address(this), _extraData);
      return true;
    }
    return false;
  }
}
