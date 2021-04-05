/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('hardhat-typechain')

module.exports = {
  solidity: '0.7.3',
  typechain: {
    outDir: 'src/types',
  },
}
