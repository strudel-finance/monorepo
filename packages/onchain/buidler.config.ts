import {usePlugin} from '@nomiclabs/buidler/config';

usePlugin('@nomiclabs/buidler-ganache');
usePlugin('@nomiclabs/buidler-waffle');
usePlugin('@nomiclabs/buidler-ethers');
usePlugin('buidler-typechain');
usePlugin('buidler-gas-reporter');
usePlugin('@openzeppelin/buidler-upgrades');
usePlugin('buidler-deploy');

const INFURA_API_KEY = process.env.INFURA_API_KEY || '';
const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY || '';

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
    buidlerevm: {},
    ganache: {
      url: 'http://127.0.0.1:8545',
      mnemonic: 'lion album emotion suffer october belt uphold mind chronic stool february flag',
      networkId: 3,
      timeout: 0,
      logger: console,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ROPSTEN_PRIVATE_KEY],
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
