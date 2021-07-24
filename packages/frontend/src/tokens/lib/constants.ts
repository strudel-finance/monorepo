import BigNumber from 'bignumber.js/bignumber'

export const SUBTRACT_GAS_LIMIT = 100000

const ONE_MINUTE_IN_SECONDS = new BigNumber(60)
const ONE_HOUR_IN_SECONDS = ONE_MINUTE_IN_SECONDS.times(60)
const ONE_DAY_IN_SECONDS = ONE_HOUR_IN_SECONDS.times(24)
const ONE_YEAR_IN_SECONDS = ONE_DAY_IN_SECONDS.times(365)

export const INTEGERS = {
  ONE_MINUTE_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ONE_DAY_IN_SECONDS,
  ONE_YEAR_IN_SECONDS,
  ZERO: new BigNumber(0),
  ONE: new BigNumber(1),
  ONES_31: new BigNumber('4294967295'), // 2**32-1
  ONES_127: new BigNumber('340282366920938463463374607431768211455'), // 2**128-1
  ONES_255: new BigNumber(
    '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  ), // 2**256-1
  INTEREST_RATE_BASE: new BigNumber('1e18'),
}

export const addressMap = {
  uniswapFactory: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95',
  uniswapFactoryV2: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  YCRV: '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8',
  UNIAmpl: '0xc5be99a02c6857f9eac67bbce58df5572498f40c',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  UNIRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  MKR: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  LEND: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03',
  SUSHIYCRV: '0x2C7a51A357d5739C5C74Bf3C96816849d2c9F726',
}

export const contractAddresses = {
  tbtc: {
    1: '0x8daebade922df735c38c80c7ebd708af50815faa',
    1337: '0x8daebade922df735c38c80c7ebd708af50815faa',
    5: '',
  },
  trdlPool: {
    1: '0x05Cc2e064e0B48e46015EAd9961F1391d74E5F83',
    1337: '0x05Cc2e064e0B48e46015EAd9961F1391d74E5F83',
  },
  tbtcPool: {
    1: '0x854056Fd40C1B52037166285B2e54Fee774d33f6',
    5: '',
    1337: '0x854056Fd40C1B52037166285B2e54Fee774d33f6',
  },
  vbtc: {
    1: '0xe1406825186D63980fd6e2eC61888f7B91C4bAe4',
    5: '0x190ca209d7174ffbf0e950cb076e901bc9250af5',
    1337: '0xe1406825186D63980fd6e2eC61888f7B91C4bAe4',
  },
  strudel: {
    1: '0x297D33e17e61C2Ddd812389C2105193f8348188a',
    5: '0x611f48792751271328f5192d83343f0bfad8b78f',
    56: '0x46c6426b0e18c61a642aca01adf668da17176bc2',
    1337: '0x297D33e17e61C2Ddd812389C2105193f8348188a',
  },
  masterChef: {
    1: '0x517b091FdB87A42c879BbB849444E76A324D53c8',
    5: '0xc80a91101adb246c286de0200bbb25f644aa1f56',
    1337: '0x517b091FdB87A42c879BbB849444E76A324D53c8',
  },
  weth: {
    1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    5: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    1337: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  relay: {
    1: '0x1531b6e3d51bf80f634957df81a990b92da4b154',
    5: '',
    56: '0x3D4FFC1E924Ed1ee6ABDA7cb9c56Bbd1E26336D4',
    100: '0x9cb9CF602B09e6c8c8B4A9Abd688d1cEe3F1c7a7',
    1337: '0x1531b6e3d51bf80f634957df81a990b92da4b154',
  },
  vbch: {
    1: '0xb5badfa6e69728adba44d67c98b05f1d1d40182e',
    5: '',
    56: '0xb5badfa6e69728adba44d67c98b05f1d1d40182e',
    100: '0x2fB16a262c868889D8f7Dd30c9738687efeca971',
    1337: '0xb5badfa6e69728adba44d67c98b05f1d1d40182e',
  },
  bridge: {
    5: '',
    56: '0x8425cfcc0155208fe1178d446d15a079d4d309f7',
  },
  AMB: {
    56: '0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59',
    100: '0x162E898bD0aacB578C8D5F8d6ca588c13d2A383F',
  },
  edgeAmb: {
    1: "0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e",
    56: "0x05185872898b6f94AA600177EF41B9334B1FA48B",
  },
  strudelMediator: {
    1: "0x1E065d816361bC3E078Ce25AC381B4B8F34F8C30",
    56: "0x94975F41C472fec289CFfB3d617dB3118D33CA18",
  },
  gStrudel: {
    1: '0x64d506ba9ba0cc9f0326cc72f134e754df0e2aff',
    1337: '0x64d506ba9ba0cc9f0326cc72f134e754df0e2aff',
  },
  mediator: {
    1: '0xb80A3Bc8A651e074164611AfEa6f9De056489d4c',
    56: '0xD8D2A43b1a99C7061aEc22e6d498addb62f99baC',
  },
}

/*
UNI-V2 LP Address on mainnet for reference
==========================================
0  USDT 0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852
1  USDC 0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc
2  DAI  0xa478c2975ab1ea89e8196811f51a7b7ade33eb11
3  sUSD 0xf80758ab42c3b07da84053fd88804bcb6baa4b5c
4  COMP 0xcffdded873554f362ac02f8fb1f02e5ada10516f
5  LEND 0xab3f9bf1d81ddb224a2014e98b238638824bcf20
6  SNX  0x43ae24960e5534731fc831386c07755a2dc33d47
7  UMA  0x88d97d199b9ed37c29d846d00d443de980832a22
8  LINK 0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974
9  BAND 0xf421c3f2e695c2d4c0765379ccace8ade4a480d9
10 AMPL 0xc5be99a02c6857f9eac67bbce58df5572498f40c
11 YFI  0x2fdbadf3c4d5a8666bc06645b8358ab803996e28
12 SUSHI 0xce84867c3c02b05dc570d0135103d3fb9cc19433
*/

export interface Pool {
  pid: number
  isBalancer: boolean
  isIndependent?: boolean
  btnText?: string
  subText?: string
  customCardBackgroundColorInHex?: string
  customCardTextColorInHex?: string
  customCardDepositColorInHex?: string
  customDepositClassname?: string
  buttonClickable?: boolean
  url: string
  lpAddresses: {
    1: string
    5?: string
  }
  tokenAddresses: {
    1: string
    5?: string
  }
  name: string
  symbol: string
  tokenSymbol: string
  icon: string
  disabled: boolean
}

export const supportedPools: Pool[] = [
  {
    pid: 9,
    isBalancer: true,
    url:
      'https://pools.balancer.exchange/#/pool/0xde5921f03ba2ec1a9efbeb6957273b5414193a3b/',
    lpAddresses: {
      1: '0x158E55b4B14C4f49da5599Ed3B26C0C8773095B2',
      5: '0xe94b35A1b5e00C9d410A4E1A5D7e65365E8DbA03'
    },
    tokenAddresses: {
      1: '0x158E55b4B14C4f49da5599Ed3B26C0C8773095B2',
    },
    name: 'Mare Fund',
    symbol: 'MARE',
    tokenSymbol: 'MARE',
    icon: '1',
    disabled: false,
  },
  {
    pid: 7,
    isBalancer: false,
    url:
      'https://app.sushi.com/add/ETH/0x297D33e17e61C2Ddd812389C2105193f8348188a',
    lpAddresses: {
      1: '0x05Cc2e064e0B48e46015EAd9961F1391d74E5F83',
    },
    tokenAddresses: {
      1: '0x297D33e17e61C2Ddd812389C2105193f8348188a',
    },
    name: 'Strudel Sushi',
    symbol: '$TRDL-ETH SLP',
    tokenSymbol: 'STRDL',
    icon: '1',
    disabled: false,
  },
  {
    pid: 4,
    isBalancer: false,
    url:
      'https://info.uniswap.org/pair/0xcFDCD696dde5df39f569807C6934E6bA97ceBb8A',
    lpAddresses: {
      1: '0xcFDCD696dde5df39f569807C6934E6bA97ceBb8A',
    },
    tokenAddresses: {
      1: '0xe1406825186d63980fd6e2ec61888f7b91c4bae4',
    },
    name: 'vBTC Spot',
    symbol: 'vBTC-ETH UNI-V2 LP',
    tokenSymbol: 'vBTC',
    icon: '2',
    disabled: false,
  },
  {
    pid: null,
    isBalancer: false,
    isIndependent: true,
    customCardBackgroundColorInHex: '#2d2e40',
    customCardTextColorInHex: '#e59310',
    customDepositClassname: 'covenants',
    btnText: 'Daily Rate: 1,000 TRDL',
    subText: 'Pool and enter farm in one transaction',
    buttonClickable: true,
    url:
      'https://covenants.eth.link/#/farm/dapp/0xFFc0bc10C9b98D53E9f4124291B23346B68D7E7a',
    lpAddresses: {
      1: '0x58645aa09d39fcfba8c5708a09258fc8a5d823f2',
    },
    tokenAddresses: {
      1: '0xb5badfa6e69728adba44d67c98b05f1d1d40182e',
    },
    name: 'vBTC-WBTC Uniswap V3 (Covenants)',
    symbol: 'vBTC-WBTC UNI-V3 LP',
    tokenSymbol: 'STRDL',
    icon: '1',
    disabled: false,
  },
  {
    pid: 10,
    isBalancer: false,
    url:
      'https://v2.info.uniswap.org/pair/0x58645aa09d39fcfba8c5708a09258fc8a5d823f2',
    lpAddresses: {
      1: '0x58645aa09d39fcfba8c5708a09258fc8a5d823f2',
    },
    tokenAddresses: {
      1: '0xb5badfa6e69728adba44d67c98b05f1d1d40182e',
    },
    name: 'vBCH Spot',
    symbol: 'vBCH-ETH UNI-V2 LP',
    tokenSymbol: 'vBCH',
    icon: '',
    disabled: false,
  },
  {
    pid: 8,
    isBalancer: false,
    url:
      'https://app.sushi.com/add/0x7BD198b9107496fD5cC3d7655AF52f43a8eDBc4C/0x297D33e17e61C2Ddd812389C2105193f8348188a',
    lpAddresses: {
      1: '0x98538aCD76451191803e1550B5CEEd3cBA4E2289',
    },
    tokenAddresses: {
      1: '0xe1406825186d63980fd6e2ec61888f7b91c4bae4',
    },
    name: 'oneVBTC Party',
    symbol: 'oneVBTC-$TRDL SLP',
    tokenSymbol: 'onevBTC',
    icon: '',
    disabled: true,
  },
  {
    pid: 1,
    isBalancer: false,
    url:
      'https://info.uniswap.org/pair/0x29b0aA11dE97f6d5A3293d980990e820BDA5FBAb',
    lpAddresses: {
      1: '0x29b0aA11dE97f6d5A3293d980990e820BDA5FBAb',
      5: '0x175a715f4c37bdb1524a396cc799f6dcb7a52fcf',
    },
    tokenAddresses: {
      1: '0x297D33e17e61C2Ddd812389C2105193f8348188a',
      5: '0x611f48792751271328f5192d83343f0bfad8b78f',
    },
    name: 'Spin Strudel',
    symbol: '$TRDL-ETH UNI-V2 LP',
    tokenSymbol: 'STRDL',
    icon: '1',
    disabled: true,
  },
  // {
  //   pid: 0,
  //   isBalancer: true,
  //   balancerPoolAddresses: {
  //     1: '0xe044bC87a030D370D64a6cA4531a08a4e67444E0',
  //     5: '0xe94b35A1b5e00C9d410A4E1A5D7e65365E8DbA03',
  //   },
  //   url: 'https://pool.strudel.finance/#/',
  //   lpAddresses: {
  //     1: '0xd439932fbc03c0f646324ef09a4a0c28c0d4008b',
  //     5: '0xcd43a034efbf5b314ab48d77b4cece93e6e7876b',
  //   },
  //   tokenAddresses: {
  //     1: '0xe1406825186D63980fd6e2eC61888f7B91C4bAe4',
  //     5: '0x190ca209d7174ffbf0e950cb076e901bc9250af5',
  //   },
  //   name: 'Power vBTC',
  //   symbol: 'VBTC-ETH LP',
  //   tokenSymbol: 'VBTC',
  //   icon: '2',
  // },
  // {
  //   pid: 6,
  //   isBalancer: false,
  //   url: 'https://sushiswap.fi/pair/0xbcedc25cbb0ea44e03e41dc2d00d54fe6d4646db',
  //   lpAddresses: {
  //     1: '0xbcedc25cbb0ea44e03e41dc2d00d54fe6d4646db',
  //     5: '',
  //   },
  //   tokenAddresses: {
  //     1: '0xe1406825186D63980fd6e2eC61888f7B91C4bAe4',
  //     5: '',
  //   },
  //   name: 'vBTC/tBTC',
  //   symbol: 'vBTC tBTC Sushi LP',
  //   tokenSymbol: 'vBTC',
  //   icon: '3',
  // },
  // {
  //   pid: 2,
  //   isBalancer: false,
  //   url:
  //     'https://info.uniswap.org/pair/0xBb2b8038a1640196FbE3e38816F3e67Cba72D940',
  //   lpAddresses: {
  //     1: '0xBb2b8038a1640196FbE3e38816F3e67Cba72D940',
  //     5: '0xb1b2312E79E8479813C4AfC025bCeCb84c9301b4',
  //   },
  //   tokenAddresses: {
  //     1: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  //     5: '0xb59D2A31C4B94F0b00214a69a98723882018E4E4',
  //   },
  //   name: 'WBTC Whale',
  //   symbol: 'WBTC-ETH UNI-V2 LP',
  //   tokenSymbol: 'WBTC',
  //   icon: '🐋',
  // },
  // {
  //   pid: 3,
  //   isBalancer: false,
  //   url:
  //     'https://info.uniswap.org/pair/0x81FbEf4704776cc5bBa0A5dF3a90056d2C6900B3',
  //   lpAddresses: {
  //     1: '0x81FbEf4704776cc5bBa0A5dF3a90056d2C6900B3',
  //     5: '0xb1b2312E79E8479813C4AfC025bCeCb84c9301b4',
  //   },
  //   tokenAddresses: {
  //     1: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
  //     5: '0xb59D2A31C4B94F0b00214a69a98723882018E4E4',
  //   },
  //   name: 'renBTC Rhino',
  //   symbol: 'renBTC-ETH UNI-V2 LP',
  //   tokenSymbol: 'renBTC',
  //   icon: '🦏',
  // },
  // {
  //   pid: 5,
  //   isBalancer: false,
  //   url:
  //     'https://info.uniswap.org/pair/0x854056Fd40C1B52037166285B2e54Fee774d33f6',
  //   lpAddresses: {
  //     1: '0x854056Fd40C1B52037166285B2e54Fee774d33f6',
  //   },
  //   tokenAddresses: {
  //     1: '0x8daebade922df735c38c80c7ebd708af50815faa',
  //   },
  //   name: 'tBTC Dino',
  //   symbol: 'tBTC-ETH UNI-V2 LP',
  //   tokenSymbol: 'tBTC',
  //   icon: '🦕',
  // },
]
