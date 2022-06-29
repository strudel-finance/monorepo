const HarmonyRelayAbi = [
    {
    inputs: [
            {
        internalType: 'bytes',
        name: 'header',
        type: 'bytes',
            },
            {
        internalType: 'uint32',
        name: 'height',
        type: 'uint32',
            },
        ],
    stateMutability: 'nonpayable',
    type: 'constructor',
    },
    {
    anonymous: false,
    inputs: [
            {
        indexed: true,
        internalType: 'bytes32',
        name: 'from',
        type: 'bytes32',
            },
            {
        indexed: true,
        internalType: 'bytes32',
        name: 'to',
        type: 'bytes32',
            },
            {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
            },
        ],
    name: 'ChainReorg',
    type: 'event',
    },
    {
    anonymous: false,
    inputs: [
            {
        indexed: true,
        internalType: 'bytes32',
        name: 'digest',
        type: 'bytes32',
            },
            {
        indexed: true,
        internalType: 'uint32',
        name: 'height',
        type: 'uint32',
            },
        ],
    name: 'StoreHeader',
    type: 'event',
    },
    {
    inputs: [],
    name: 'CONFIRMATIONS',
    outputs: [
            {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [],
    name: 'DIFFICULTY_ADJUSTMENT_INTERVAL',
    outputs: [
            {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [],
    name: 'MAIN_CHAIN_ID',
    outputs: [
            {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [
            {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
            },
        ],
    name: '_chain',
    outputs: [
            {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [],
    name: '_epochEndTarget',
    outputs: [
            {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [],
    name: '_epochEndTime',
    outputs: [
            {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [],
    name: '_epochStartTarget',
    outputs: [
            {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [],
    name: '_epochStartTime',
    outputs: [
            {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [
            {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
            },
        ],
    name: '_forks',
    outputs: [
            {
        internalType: 'uint32',
        name: 'height',
        type: 'uint32',
            },
            {
        internalType: 'bytes32',
        name: 'ancestor',
        type: 'bytes32',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [
            {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
            },
        ],
    name: '_headers',
    outputs: [
            {
        internalType: 'uint32',
        name: 'height',
        type: 'uint32',
            },
            {
        internalType: 'uint64',
        name: 'chainId',
        type: 'uint64',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [],
    name: 'getBestBlock',
    outputs: [
            {
        internalType: 'bytes32',
        name: 'digest',
        type: 'bytes32',
            },
            {
        internalType: 'uint32',
        name: 'height',
        type: 'uint32',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [
            {
        internalType: 'uint32',
        name: 'height',
        type: 'uint32',
            },
        ],
    name: 'getBlockHash',
    outputs: [
            {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [
            {
        internalType: 'bytes32',
        name: 'digest',
        type: 'bytes32',
            },
        ],
    name: 'getBlockHeight',
    outputs: [
            {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
    {
    inputs: [
            {
        internalType: 'uint256',
        name: 'prevStartTarget',
        type: 'uint256',
            },
            {
        internalType: 'uint64',
        name: 'prevStartTime',
        type: 'uint64',
            },
            {
        internalType: 'uint256',
        name: 'prevEndTarget',
        type: 'uint256',
            },
            {
        internalType: 'uint64',
        name: 'prevEndTime',
        type: 'uint64',
            },
            {
        internalType: 'uint256',
        name: 'nextTarget',
        type: 'uint256',
            },
        ],
    name: 'isCorrectDifficultyTarget',
    outputs: [
            {
        internalType: 'bool',
        name: '',
        type: 'bool',
            },
        ],
    stateMutability: 'pure',
    type: 'function',
    },
    {
    inputs: [
            {
        internalType: 'bytes',
        name: 'header',
        type: 'bytes',
            },
        ],
    name: 'submitBlockHeader',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    },
    {
    inputs: [
            {
        internalType: 'bytes',
        name: 'headers',
        type: 'bytes',
            },
        ],
    name: 'submitBlockHeaderBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    },
    {
    inputs: [
            {
        internalType: 'uint32',
        name: 'height',
        type: 'uint32',
            },
            {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
            },
            {
        internalType: 'bytes32',
        name: 'txid',
        type: 'bytes32',
            },
            {
        internalType: 'bytes',
        name: 'header',
        type: 'bytes',
            },
            {
        internalType: 'bytes',
        name: 'proof',
        type: 'bytes',
            },
            {
        internalType: 'uint256',
        name: 'confirmations',
        type: 'uint256',
            },
            {
        internalType: 'bool',
        name: 'insecure',
        type: 'bool',
            },
        ],
    name: 'verifyTx',
    outputs: [
            {
        internalType: 'bool',
        name: '',
        type: 'bool',
            },
        ],
    stateMutability: 'view',
    type: 'function',
    },
]

export default HarmonyRelayAbi