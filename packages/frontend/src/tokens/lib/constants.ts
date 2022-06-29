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
    5: '',
    1337: '0x8daebade922df735c38c80c7ebd708af50815faa',
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

    // Harmony mainnet
    1666600000: '0xDb29b395e5E216593C406D9ecC3222580c636Fd4',
    // Harmony testnet
    1666700000: '0x2e33ed83aec04e2ad7a05178489b3da7ee1a1d42',
  },
  strudel: {
    1: '0x297D33e17e61C2Ddd812389C2105193f8348188a',
    5: '0x611f48792751271328f5192d83343f0bfad8b78f',
    56: '0x46c6426b0e18c61a642aca01adf668da17176bc2',
    1337: '0x297D33e17e61C2Ddd812389C2105193f8348188a',
    
    // Harmony mainnet
    1666600000: '0x8a3937950BF912c1680b7366DB4D1731E45F7fAA',
    // Harmony testnet
    1666700000: '0x79253d7F16Ef56CAFC881ec5BFa14551F2e04118',
  },
  masterChef: {
    1: '0x517b091FdB87A42c879BbB849444E76A324D53c8',
    5: '0xc80a91101adb246c286de0200bbb25f644aa1f56',
    1337: '0x517b091FdB87A42c879BbB849444E76A324D53c8',

    // Temporary
    // Harmony mainnet (Not deployed yet)
    // 1666600000: '',
    // Harmony testnet (Deployed)
    // 1666700000: '0x2e33ed83aec04e2ad7a05178489b3da7ee1a1d42',
  },
  weth: {
    1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    5: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    1337: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',

    // Harmony mainnet
    1666600000: '',
    // Harmony testnet (Deployed)
    1666700000: '0x2e33ed83aec04e2ad7a05178489b3da7ee1a1d42',
  },
  relay: {
    1: '0x1531b6e3d51bf80f634957df81a990b92da4b154',
    5: '',
    56: '0x3D4FFC1E924Ed1ee6ABDA7cb9c56Bbd1E26336D4',
    100: '0x9cb9CF602B09e6c8c8B4A9Abd688d1cEe3F1c7a7',
    1337: '0x1531b6e3d51bf80f634957df81a990b92da4b154',

    // Harmony mainnet
    // https://explorer.harmony.one/address/0xd4dbf2b5fa257718d7e1fb0d4cbfbc372097d888
    // https://btc.harmony.one/dashboard/relay and https://btc.harmony.one/dashboard/relay
    1666600000: '0xd4dbf2b5fa257718d7e1fb0d4cbfbc372097d888', 
    1666700000: '0x3df0f698573e3a7957a1d582b93e8fa202b15d6c', 
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
  disabled: boolean,
  canSelect: boolean,
  useLPWethValue: boolean
}

export const supportedPools: Pool[] = [
  {
    pid: 13,
    isBalancer: true,
    useLPWethValue: false,
    url:
      'https://app.zerion.io/explore/asset/vNFT-0xd8833594420db3d6589c1098dbdd073f52419dba',
    lpAddresses: {
      1: '0xd8833594420db3d6589c1098dbdd073f52419dba',
    },
    tokenAddresses: {
      1: '0xd8833594420db3d6589c1098dbdd073f52419dba',
    },
    name: 'Strudel BlueChip Index',
    symbol: 'vNFT',
    tokenSymbol: 'vNFT',
    icon: '1',
    disabled: false,
    canSelect: true
  },
  {
    pid: 1,
    isBalancer: false,
    useLPWethValue: false,
    url:
      'https://v2.info.uniswap.org/pair/0x29b0aa11de97f6d5a3293d980990e820bda5fbab',
    lpAddresses: {
      1: '0x29b0aA11dE97f6d5A3293d980990e820BDA5FBAb',
    },
    tokenAddresses: {
      1: '0x297d33e17e61c2ddd812389c2105193f8348188a',
    },
    name: 'Strudel Uni',
    symbol: '$TRDL-ETH LP',
    tokenSymbol: 'STRDL',
    icon: '1',
    disabled: false,
    canSelect: true
  },
  {
    pid: 4,
    isBalancer: false,
    useLPWethValue: false,
    url:
      'https://v2.info.uniswap.org/pair/0xcFDCD696dde5df39f569807C6934E6bA97ceBb8A',
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
    canSelect: true
  },
  {
    pid: 12,
    isBalancer: false,
    useLPWethValue: true,
    url:
      'https://app.zerion.io/explore/asset/UNI-V2-0x7e836E605Cb85540775842F4B13df0742FBb208E',
    lpAddresses: {
      1: '0x7e836E605Cb85540775842F4B13df0742FBb208E',
    },
    tokenAddresses: {
      1: '0xe1406825186D63980fd6e2eC61888f7B91C4bAe4',
    },
    name: 'STRDL-VBTC',
    symbol: 'STRDL-VBTC LP',
    tokenSymbol: 'STRDL',
    icon: '2',
    disabled: false,
    canSelect: true
  }
]
