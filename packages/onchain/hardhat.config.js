/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("hardhat-typechain");

module.exports = {
  solidity: "0.6.6",
  typechain: {
    outDir: "src/types",
  },
};
