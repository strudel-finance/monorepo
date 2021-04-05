import { VbtcToken } from './abi/types/VbtcToken'
import { StrudelToken } from './abi/types/StrudelToken'
import { TorchShip } from './abi/types/TorchShip'
import { IWETH9 } from './abi/types/IWETH9'
import { IRelay } from './abi/types/IRelay'
import { IERC20 } from './abi/types/IERC20'
import { IUniswapV2Pair } from './abi/types/IUniswapV2Pair'
import { Contract } from 'web3-eth-contract'

export type VbtcContract = Contract & VbtcToken
export type StrudelContract = Contract & StrudelToken
export type MasterChefContract = Contract & TorchShip
export type WethContract = Contract & IWETH9
export type RelayContract = Contract & IRelay
export type ERC20Contract = Contract & IERC20
export type UniContract = Contract & IUniswapV2Pair
