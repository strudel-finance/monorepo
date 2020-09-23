pragma solidity ^0.5.10;

import {IRelay} from "../IRelay.sol";

/** @title Relay */
/** @author Summa (https://summa.one) */

contract MockRelay is IRelay {

    bytes32 bestKnownDigest;
    bytes32 lastReorgCommonAncestor;
    mapping(bytes32 => uint256) heights;

    constructor(
      bytes32 _bestKnownDigest,
      uint256 _bestKnownHeight,
      bytes32 _lastReorgCommonAncestor,
      uint256 _lastReorgHeight) public {
      bestKnownDigest = _bestKnownDigest;
      heights[_bestKnownDigest] = _bestKnownHeight;
      lastReorgCommonAncestor = _lastReorgCommonAncestor;
      heights[_lastReorgCommonAncestor] = _lastReorgHeight;
    }

    function addHeader(bytes32 _digest, uint256 _height) external {
      heights[_digest] = _height;
    }

    /// @notice     Getter for bestKnownDigest
    /// @dev        This updated only by calling markNewHeaviest
    /// @return     The hash of the best marked chain tip
    function getBestKnownDigest() public view returns (bytes32) {
      return bestKnownDigest;
    }

    /// @notice     Getter for relayGenesis
    /// @dev        This is updated only by calling markNewHeaviest
    /// @return     The hash of the shared ancestor of the most recent fork
    function getLastReorgCommonAncestor() public view returns (bytes32) {
      return lastReorgCommonAncestor;
    }

    /// @notice         Finds the height of a header by its digest
    /// @dev            Will fail if the header is unknown
    /// @param _digest  The header digest to search for
    /// @return         The height of the header, or error if unknown
    function findHeight(bytes32 _digest) external view returns (uint256) {
      return heights[_digest];
    }

    /// @notice             Checks if a digest is an ancestor of the current one
    /// @dev                Limit the amount of lookups (and thus gas usage) with _limit
    /// @param _ancestor    The prospective ancestor
    /// @param _descendant  The descendant to check
    /// @param _limit       The maximum number of blocks to check
    /// @return             true if ancestor is at most limit blocks lower than descendant, otherwise false
    function isAncestor(bytes32 _ancestor, bytes32 _descendant, uint256 _limit) external view returns (bool) {
      return true;
    }
}