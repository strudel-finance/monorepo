// SPDX-License-Identifier: MPL

pragma solidity ^0.6.0;

interface IRelay {
    /**
     * @param digest block header hash of block header submitted for storage
     * @param height height of the stored block
     */
    event StoreHeader(bytes32 indexed digest, uint32 indexed height);

    /**
     * @notice Parses, validates and stores a block header
     * @param header Raw block header bytes (80 bytes)
     */
    function submitBlockHeader(uint8 prevPos, bytes calldata header) external;

    /**
     * @notice Parses, validates and stores a batch of headers
     * @param headers Raw block headers (80* bytes)
     */
    function submitBlockHeaderBatch(uint8 prevPos, bytes calldata headers) external;

    /**
     * @notice Gets the height of an included block
     * @param digest Hash of the referenced block
     * @return Height of the stored block, reverts if not found
     */
    function getBlockHeight(bytes32 digest) external view returns (uint32);

    /**
     * @notice Gets the hash of an included block
     * @param height Height of the referenced block
     * @return Hash of the stored block, reverts if not found
     */
    function getBlockHash(uint32 height) external view returns (bytes32);

    /**
     * @notice Gets the hash and height for the best tip
     * @return digest Hash of stored block
     * @return height Height of stored block
     */
    function getBestBlock()
        external
        view
        returns (bytes32 digest, uint32 height);

}