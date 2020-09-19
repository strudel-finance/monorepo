declare const config: {
    defaultNetwork: string;
    solc: {
        version: string;
        optimizer: {
            enabled: boolean;
            runs: number;
        };
    };
    paths: {
        sources: string;
        tests: string;
    };
    typechain: {
        outDir: string;
        target: string;
    };
    networks: {
        buidlerevm: {};
        ganache: {
            url: string;
            mnemonic: string;
            networkId: number;
            timeout: number;
            logger: Console;
        };
        ropsten: {
            url: string;
            accounts: string[];
        };
    };
    gasReporter: {
        enabled: boolean;
        coinmarketcap: string | undefined;
        currency: string;
        src: string;
    };
};
export default config;
