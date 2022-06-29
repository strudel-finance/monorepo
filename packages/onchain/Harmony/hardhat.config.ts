import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ganache';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-typechain';
import 'hardhat-gas-reporter';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-etherscan';

// Include this because of the contract size error
import 'hardhat-contract-sizer';

require('dotenv').config();

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

const HARMONY_PRIVATE_KEY = process.env.HARMONY_PRIVATE_KEY;

// allowUnlimitedContractSize
const config = {
  defaultNetwork: 'hardhat',
  solidity: {
    version: '0.6.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },

  namedAccounts: {
    deployer: 0, 

    // https://multisig.harmony.one/#/safes/0x1567442538f5f0d0411DED1F701d95fc79E80197/settings
    multisig: '0x1567442538f5f0d0411DED1F701d95fc79E80197',
    
    // https://btc.harmony.one/dashboard/relay
    // https://explorer.harmony.one/address/0xd4dbf2b5fa257718d7e1fb0d4cbfbc372097d888
    relayer: '0xd4dbf2b5fa257718d7e1fb0d4cbfbc372097d888',
    
  },
  networks: {
    hardhat: {
      // This makes it pass the contract size error
      allowUnlimitedContractSize: true,

      accounts: [
        {
          privateKey: '0x043a569345b08ead19d1d4ba3462b30632feba623a2a85a3b000eb97f709f09f',
          balance: '1000000000000000000000',
        },
        {
          privateKey: '0xb571e737b642fc4936134795b8af8190f9fa37cee09b4137a5deca462a9e9bbd',
          balance: '1000000000000000000000',
        },
        {
          privateKey: '0x21f9455324a966565e2642cefa72803c0f9a8e0bf39d3919b09e5aeb3f715e62',
          balance: '1000000000000000000000',
        },
        {
          privateKey: '0xb3c061d61efdb1dc57c2c6ed619f05b31742dcdc12a96cf4cf90ec8d0e450d88',
          balance: '1000000000000000000000',
        },
        {
          privateKey: '0xe2037d7b4a01e38c4310a75022c7fd4250c1a9ca2d3551b9d08a4769dc6543e8',
          balance: '1000000000000000000000',
        },
      ],
    },
    ganache: {
      url: 'http://127.0.0.1:8545',
      mnemonic: 'lion album emotion suffer october belt uphold mind chronic stool february flag',
      hdPath: "m/44'/60'/0'/0",
      networkId: 3,
      timeout: 0,
    },

    harmony_testnet: {
      // allowUnlimitedContractSize: true,

      url: `https://api.s0.b.hmny.io`,
      accounts: [`${HARMONY_PRIVATE_KEY}`],
    },

    harmony_mainnet: {
      url: `https://api.harmony.one`,
      accounts: [`${HARMONY_PRIVATE_KEY}`],
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: 'blablabla',
  },
  gasReporter: {
    enabled: COINMARKETCAP_API_KEY ? true : false,
    coinmarketcap: COINMARKETCAP_API_KEY,
    currency: 'EUR',
    src: './contracts',
  },
};

export default config;
