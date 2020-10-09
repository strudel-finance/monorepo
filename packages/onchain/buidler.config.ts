import {usePlugin} from '@nomiclabs/buidler/config';

usePlugin('@nomiclabs/buidler-ganache');
usePlugin('@nomiclabs/buidler-waffle');
usePlugin('@nomiclabs/buidler-ethers');
usePlugin('buidler-typechain');
usePlugin('buidler-gas-reporter');
usePlugin('@openzeppelin/buidler-upgrades');
usePlugin('buidler-deploy');

const INFURA_API_KEY = process.env.INFURA_API_KEY || '';
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || '';

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const config = {
  defaultNetwork: 'buidlerevm',
  solc: {
    version: '0.6.6',
    optimizer: {enabled: true, runs: 500},
  },
  paths: {
    sources: './contracts',
    tests: './test',
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  namedAccounts: {
    deployer: 0,
    relayer: '0x1531b6e3d51bf80f634957df81a990b92da4b154', // suma relayer
  },
  networks: {
    buidlerevm: {
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
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
    },
  },
  gasReporter: {
    enabled: COINMARKETCAP_API_KEY ? true : false,
    coinmarketcap: COINMARKETCAP_API_KEY,
    currency: 'EUR',
    src: './contracts',
  },
};

export default config;
