// SPDX-License-Identifier: MPL-2.0

pragma solidity 0.6.6;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "./erc20/ITokenRecipient.sol";

/// @title  Strudel Token.
/// @notice This is the Strudel ERC20 contract.
contract GovernanceToken is ERC20UpgradeSafe {
  using SafeMath for uint256;

  uint256 constant BLOCKS_IN_WEEK = 45000;
  uint256 constant MAX_LOCK = 45000 * 52;
  bytes32 public DOMAIN_SEPARATOR;
  // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
  bytes32
    public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
  mapping(address => uint256) public nonces;

  IERC20 strudel;
  mapping(address => uint256) public locks;

  constructor(address strudelAddr) public {
    __ERC20_init("Strudel Governance Token", "g$TRDL");
    uint256 chainId;
    assembly {
      chainId := chainid()
    }
    DOMAIN_SEPARATOR = keccak256(
      abi.encode(
        keccak256(
          "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        ),
        keccak256(bytes("g$TRDL")),
        keccak256(bytes("1")),
        chainId,
        address(this)
      )
    );
    require(strudelAddr != address(0), "zero strudel");
    strudel = IERC20(strudelAddr);
  }

  function _parse(uint256 lockData) internal pure returns (uint256 endBlock, uint256 locked, uint256 minted) {
    endBlock = lockData >> 224;
    locked = uint256(uint112(lockData >> 112));
    minted = uint256(uint112(lockData));
  }

  function _compact(uint256 endBlock, uint256 locked, uint256 minted) internal pure returns (uint256 lockData) {
    lockData = lockData << 224 | uint112(lockData) <<  112 | uint112(lockData);
  }

  function lock(uint256 amount, uint256 blocks) external returns (bool) {
    require(blocks >= BLOCKS_IN_WEEK, "lock too short");
    require(blocks <= MAX_LOCK, "lock too long");
    require(amount >= 1e15, "small deposit");
    strudel.transferFrom(msg.sender, address(this), amount);

    uint256 mintAmount = MAX_LOCK.mul(2).sub(blocks).mul(blocks).mul(amount).div(MAX_LOCK.mul(MAX_LOCK));

    uint256 endBlock;
    uint256 locked;
    uint256 minted;
    (endBlock, locked, minted) = _parse(locks[msg.sender]);

    // return previous lock, if matured
    if (locked > 0 && block.number >= endBlock) {
      unlock();
      endBlock = block.number;
      locked = 0;
      minted = 0;
      
    }

    uint256 remainingLock = endBlock - block.number;
    uint256 averageDuration = remainingLock.mul(locked).add(amount.mul(blocks)).div(amount.add(locked));

    locks[msg.sender] = _compact(block.number + averageDuration, locked + amount, mintAmount + minted);

    _mint(msg.sender, mintAmount);
    return true;
  }

  function unlock() public returns (bool) {
    uint256 endBlock;
    uint256 locked;
    uint256 minted;
    (endBlock, locked, minted) = _parse(locks[msg.sender]);
    require(locked > 0, "nothing to unlock");
    require(endBlock <= block.number, "lock has not passed yet");
    locks[msg.sender] = 0;
    _burn(msg.sender, minted);
    strudel.transfer(msg.sender, locked);
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

  function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external {
    require(deadline >= block.timestamp, "Strudel: EXPIRED");
    bytes32 digest = keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline))
      )
    );
    address recoveredAddress = ecrecover(digest, v, r, s);
    require(
      recoveredAddress != address(0) && recoveredAddress == owner,
      "Strudel: INVALID_SIGNATURE"
    );
    _approve(owner, spender, value);
  }
}
