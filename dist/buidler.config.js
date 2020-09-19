"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("@nomiclabs/buidler/config");
config_1.usePlugin('@nomiclabs/buidler-ganache');
config_1.usePlugin('@nomiclabs/buidler-waffle');
config_1.usePlugin('buidler-typechain');
config_1.usePlugin('buidler-gas-reporter');
var INFURA_API_KEY = process.env.INFURA_API_KEY || '';
var ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY || '';
var COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
var config = {
    defaultNetwork: 'buidlerevm',
    solc: {
        version: '0.6.6',
        optimizer: { enabled: true, runs: 500 }
    },
    paths: {
        sources: './contracts',
        tests: './test'
    },
    typechain: {
        outDir: 'typechain',
        target: 'ethers'
    },
    networks: {
        buidlerevm: {},
        ganache: {
            url: 'http://127.0.0.1:8545',
            mnemonic: 'lion album emotion suffer october belt uphold mind chronic stool february flag',
            networkId: 3,
            timeout: 0,
            logger: console
        },
        ropsten: {
            url: "https://ropsten.infura.io/v3/" + INFURA_API_KEY,
            accounts: [ROPSTEN_PRIVATE_KEY]
        }
    },
    gasReporter: {
        enabled: COINMARKETCAP_API_KEY ? true : false,
        coinmarketcap: COINMARKETCAP_API_KEY,
        currency: 'EUR',
        src: './contracts'
    }
};
exports.default = config;
