// SPDX-License-Identifier: MPL

pragma solidity >=0.4.22 <0.8.0;

import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";
import {ERC20Detailed} from "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import {ERC20Mintable} from "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import {Ownable} from "@openzeppelin/contracts/ownership/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {ITokenRecipient} from "./ITokenRecipient.sol";
import {TypedMemView} from "@summa-tx/bitcoin-spv-sol/contracts/TypedMemView.sol";
import {ViewBTC} from "@summa-tx/bitcoin-spv-sol/contracts/ViewBTC.sol";
import {ViewSPV} from "@summa-tx/bitcoin-spv-sol/contracts/ViewSPV.sol";
import {IRelay} from "./IRelay.sol";

/// @title  VBTC Token.
/// @notice This is the VBTC ERC20 contract.
contract VBTCToken is ERC20Detailed, ERC20Capped, Ownable {
  using SafeMath for uint256;
  using TypedMemView for bytes;
  using TypedMemView for bytes29;
  using ViewBTC for bytes29;
  using ViewSPV for bytes29;

  event Burn(bytes32 indexed btcTxHash, address indexed receiver, uint256 amount);

  uint8 constant ADDR_LEN = 20;
  uint256 constant BTC_CAP = 21*10**24;
  uint256 constant BTC_CAP_SQRT = 4582575700000; // sqrt(BTC_CAP)

  uint256 public numConfs;
  IRelay public relay;
  ERC20Mintable public strudel;
  address public devFund;
  uint256 public devFundDivRate = 50;
  uint256 public relayReward;

  // storing all sucessfully processed outputs
  mapping(bytes32 => bool) knownOutputs;

  /// @dev Constructor, calls ERC20 constructor to set Token info
  ///      ERC20(TokenName, TokenSymbol)
  constructor(address _relay, address _strudel, uint256 _minConfs, address _devFund, uint256 _relayReward)
    ERC20Detailed("vBTC", "VBTC", 18)
    ERC20Capped(BTC_CAP)
  public {
    relay = IRelay(_relay);
    strudel = ERC20Mintable(_strudel);
    numConfs = _minConfs;
    devFund = _devFund;
    relayReward = _relayReward;
  }

  function makeOutpoint(uint256 _index, bytes32 _txid) internal pure returns (bytes32) {
    // sacrifice 1 byte instead of hashing
    return (_txid >> 1) << 1 | bytes32(uint256(uint8(_index)));
  }


  function sqrt(uint256 y) internal pure returns (uint256 z) {
    if (y > 3) {
      z = y;
      uint x = y / 2 + 1;
      while (x < z) {
        z = x;
        x = (y / x + x) / 2;
      }
    } else if (y != 0) {
      z = 1;
    }
  }

  /// @notice             Verifies inclusion of a tx in a header, and that header in the Relay chain
  /// @dev                Specifically we check that both the best tip and the heaviest common header confirm it
  /// @param  _header     The header containing the merkleroot committing to the tx
  /// @param  _proof      The merkle proof intermediate nodes
  /// @param  _index      The index of the tx in the merkle tree's leaves
  /// @param  _txid       The txid that is the proof leaf
  function _checkInclusion(
    bytes29 _header,    // Header
    bytes29 _proof,     // MerkleArray
    uint256 _index,
    bytes32 _txid
  ) internal view returns (bool) {

    // check the txn is included in the header
    require(
      ViewSPV.prove(
        _txid,
        _header.merkleRoot(),
        _proof,
        _index),
      "Bad inclusion proof");

    // check the header is included in the chain
    bytes32 headerHash = _header.hash256();
    bytes32 GCD = relay.getLastReorgCommonAncestor();
    require(
      relay.isAncestor(headerHash, GCD, 240),
      "GCD does not confirm header"
    );

    // check offset to tip
    bytes32 bestKnownDigest = relay.getBestKnownDigest();
    uint256 offset = relay.findHeight(bestKnownDigest).sub(relay.findHeight(headerHash));
    require(offset >= numConfs, "Insufficient confirmations");

    return true;
  }

  /// @dev             Mints an amount of the token and assigns it to an account.
  ///                  Uses the internal _mint function.
  /// @param _header   header
  /// @param _proof    proof
  /// @param _version    index
  /// @param _locktime    index
  /// @param _burnOutputIndex    index
  /// @param _index    index
  /// @param _vin    index
  /// @param _vout    index
  function proofOpReturnAndMint(
    bytes calldata _header,
    bytes calldata _proof,
    bytes4 _version,
    bytes4 _locktime,
    uint256 _index,
    uint8 _burnOutputIndex,
    bytes calldata _vin,
    bytes calldata _vout
  ) external returns (bool) {
    return _provideProof(_header, _proof,  _version, _locktime, _index, _burnOutputIndex, _vin, _vout);
  }


  function _provideProof(
    bytes memory _header,
    bytes memory _proof,
    bytes4 _version,
    bytes4 _locktime,
    uint256 _index,
    uint8 _burnOutputIndex,
    bytes memory _vin,
    bytes memory _vout
  ) internal returns (bool) {
    bytes32 txId = abi.encodePacked(_version, _vin, _vout, _locktime).ref(0).hash256();
    bytes32 outpoint = makeOutpoint(_index, txId);
    require(!knownOutputs[outpoint], "already processed outputs");

    _checkInclusion(
      _header.ref(0).tryAsHeader().assertValid(),
      _proof.ref(0).tryAsMerkleArray().assertValid(),
      _index,
      txId
    );

    // mark processed
    knownOutputs[outpoint] = true;

    // do payouts
    address account;
    uint256 amount;
    (account, amount) = doPayouts(_vout.ref(0).tryAsVout(), _burnOutputIndex);
    emit Burn(txId, account, amount);
    return true;
  }

  function doPayouts(bytes29 _vout, uint256 _burnOutputIndex) internal returns (address account, uint256 amount) {
    bytes29 output = _vout.indexVout(_burnOutputIndex);

    // extract receiver and address
    amount = output.value() * 10**10; // wei / satosh = 10^18 / 10^8 = 10^10
    require(amount > 0, "output has 0 value");

    bytes29 opReturnPayload = output.scriptPubkey().opReturnPayload();
    //require(opReturnPayload.len() == ADDR_LEN, "invalid op-return payload length");
    // account = address(bytes20(opReturnPayload.index(0, ADDR_LEN)));
    account = msg.sender;

    uint256 sqrtVbtcBefore = sqrt(totalSupply());
    _mint(account, amount);
    uint256 sqrtVbtcAfter = sqrt(totalSupply());
    
    // calculate the reward as area h(x) = f(x) - g(x), where f(x) = x^2 and g(x) = |minted|
    // pay out only the delta to the previous claim: H(after) - H(before)
    // this caps all minting rewards to 2/3 of BTC_CAP
    uint256 rewardAmount = BTC_CAP.mul(3).mul(sqrtVbtcAfter).add(sqrtVbtcBefore**3).sub(BTC_CAP.mul(3).mul(sqrtVbtcBefore)).sub(sqrtVbtcAfter**3).div(3).div(BTC_CAP_SQRT);
    strudel.mint(account, rewardAmount);
    strudel.mint(devFund, rewardAmount.div(devFundDivRate));
  }

  function proofP2FSHAndMint(
    bytes calldata _header,
    bytes calldata _proof,
    uint256 _index,
    bytes32 _txid,
    bytes32 _r,
    bytes32 _s,
    uint8 _v
  ) external returns (bool) {
    return false;
  }

  function addHeaders(bytes calldata _anchor, bytes calldata _headers) external returns (bool) {
    require(relay.addHeaders(_anchor, _headers), "add header failed");
    strudel.mint(msg.sender, relayReward);
  }

  function addHeadersWithRetarget(
    bytes calldata _oldPeriodStartHeader,
    bytes calldata _oldPeriodEndHeader,
    bytes calldata _headers
  ) external returns (bool) {
    require(relay.addHeadersWithRetarget(
      _oldPeriodStartHeader,
      _oldPeriodEndHeader,
      _headers
    ), "add header with retarget failed");
    strudel.mint(msg.sender, relayReward);
  }

  function markNewHeaviest(
    bytes32 _ancestor,
    bytes calldata _currentBest,
    bytes calldata _newBest,
    uint256 _limit
  ) external returns (bool) {
    require(relay.markNewHeaviest(
      _ancestor,
      _currentBest,
      _newBest,
      _limit
    ), "mark new heaviest failed");
    strudel.mint(msg.sender, relayReward.div(2));
  }

  /// @dev             Burns an amount of the token from the given account's balance.
  ///                  deducting from the sender's allowance for said account.
  ///                  Uses the internal _burn function.
  /// @param _account  The account whose tokens will be burnt.
  /// @param _amount   The amount of tokens that will be burnt.
  function burnFrom(address _account, uint256 _amount) external {
    _burnFrom(_account, _amount);
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
  ) public returns (bool) { // not external to allow bytes memory parameters
    if (approve(address(_spender), _value)) {
      _spender.receiveApproval(msg.sender, _value, address(this), _extraData);
      return true;
    }
    return false;
  }

  function setDevFundDivRate(uint256 _devFundDivRate) public onlyOwner {
    require(_devFundDivRate > 0, "!devFundDivRate-0");
    devFundDivRate = _devFundDivRate;
  }

  function setRelayReward(uint256 _newRelayReward) public onlyOwner {
    require(_newRelayReward > 0, "!newRelayReward-0");
    relayReward = _newRelayReward;
  }
}
