import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { getWeight } from '../utils/bpool'
import UNIV2PairAbi from './lib/abi/uni_v2_lp.json'
import ERC20Abi from './lib/abi/erc20.json'
import { contractAddresses } from './lib/constants.js'
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  },
}

export const getMasterChefAddress = (vbtc) => {
  return vbtc && vbtc.masterChefAddress
}
export const getVbtcAddress = (vbtc) => {
  return vbtc && vbtc.vbtcAddress
}

export const getStrudelAddress = (vbtc) => {
  return vbtc && vbtc.strudelAddress
}

export const getRelayContract = (vbtc) => {
  return vbtc && vbtc.contracts && vbtc.contracts.relay
}

export const getWethContract = (vbtc) => {
  return vbtc && vbtc.contracts && vbtc.contracts.weth
}

export const getMasterChefContract = (vbtc) => {
  return vbtc && vbtc.contracts && vbtc.contracts.masterChef
}
export const getVbtcContract = (vbtc) => {
  return vbtc && vbtc.contracts && vbtc.contracts.vbtc
}

export const getStrudelContract = (vbtc) => {
  return vbtc && vbtc.contracts && vbtc.contracts.strudel
}

export const getFarms = (vbtc) => {
  return vbtc
    ? vbtc.contracts.pools.map(
        ({
          pid,
          isBalancer,
          url,
          name,
          symbol,
          icon,
          tokenAddress,
          tokenSymbol,
          tokenContract,
          lpAddress,
          lpContract,
          balancerPoolAddress,
          balancerPoolContract,
        }) => ({
          pid,
          isBalancer,
          url,
          id: symbol,
          name,
          lpToken: symbol,
          lpTokenAddress: lpAddress,
          lpContract,
          tokenAddress,
          tokenSymbol,
          tokenContract,
          earnToken: '$TRDL',
          earnTokenAddress: vbtc.contracts.strudel.options.address,
          icon,
          balancerPoolAddress,
          balancerPoolContract,
        }),
      )
    : []
}

export const getPoolWeight = async (masterChefContract, pid) => {
  const { allocPoint } = await masterChefContract.methods.poolInfo(pid).call()
  const totalAllocPoint = await masterChefContract.methods
    .totalAllocPoint()
    .call()
  return new BigNumber(allocPoint).div(new BigNumber(totalAllocPoint))
}

export const getMultiplier = async (masterChefContract, blockNumber, vbtc) => {
  if(blockNumber < 1){
    blockNumber = await vbtc.web3.eth.getBlockNumber()
  }
    const multiplier = await masterChefContract.methods.getMultiplier(blockNumber -1, blockNumber).call()
    return new BigNumber(multiplier).div(new BigNumber(10).pow(18))
  
}

export const getEarned = async (masterChefContract, pid, account) => {
  return masterChefContract.methods.pendingStrudel(pid, account).call()
}

const getValueOfTbtcWeth = async (
  vbtc,
  wethContract,
  lpContract,
  portionLp,
) => {
  // Get total weth value for the lpContract = w1
  let tbtcPool = new vbtc.web3.eth.Contract(
    UNIV2PairAbi,
    contractAddresses.tbtcPool['1'],
  )
  let tbtc = new vbtc.web3.eth.Contract(ERC20Abi, contractAddresses.tbtc['1'])
  const tbtcContractWeth = await wethContract.methods
    .balanceOf(tbtcPool.options.address)
    .call()
  const tbtcContractTbtc = await tbtc.methods
    .balanceOf(tbtcPool.options.address)
    .call()
  const lpContractTBTC = await tbtc.methods
    .balanceOf(lpContract.options.address)
    .call()
  let tbtcPrice = new BigNumber(tbtcContractWeth).div(
    new BigNumber(tbtcContractTbtc),
  )
  let lpContractWeth = new BigNumber(lpContractTBTC).times(tbtcPrice)
  let totalLpWethValue = portionLp.times(lpContractWeth).times(new BigNumber(2))
  return [totalLpWethValue, lpContractWeth]
}

export const getTotalLPWethValue = async (
  isBalancer,
  masterChefContract,
  wethContract,
  lpContract,
  tokenContract,
  pid,
  vbtcContract,
  balancerPoolContract,
  vbtc,
  block
) => {
  // Get balance of the token address
  const tokenAmountWholeLP = await tokenContract.methods
    .balanceOf(lpContract.options.address)
    .call()
  const tokenDecimals = await tokenContract.methods.decimals().call()
  // Get the share of lpContract that masterChefContract owns
  const balance = await lpContract.methods
    .balanceOf(masterChefContract.options.address)
    .call()
  // Convert that into the portion of total lpContract = p1
  const totalSupply = await lpContract.methods.totalSupply().call()

  //switch to Balancer Pool to get included wETH amount as ReservePoolController holds LP token and pool assets
  if (isBalancer) {
    lpContract = balancerPoolContract
  }
  let totalLpWethValue
  let lpContractWeth
  // Return p1 * w1 * 2
  const portionLp = new BigNumber(balance).div(new BigNumber(totalSupply))
  let lpWethWorth
  if (pid === 6) {
    ;[totalLpWethValue, lpContractWeth] = await getValueOfTbtcWeth(
      vbtc,
      wethContract,
      lpContract,
      portionLp,
    )
  } else {
    // Get total weth value for the lpContract = w1
    lpContractWeth = await wethContract.methods
      .balanceOf(lpContract.options.address)
      .call()

    lpWethWorth = new BigNumber(lpContractWeth)

    //include weight into account if it is the Balancer Pool
    if (isBalancer) {
      totalLpWethValue = portionLp
        .times(lpWethWorth)
        .times(
          new BigNumber(1).plus(
            new BigNumber(await getWeight(lpContract, vbtcContract)),
          ),
        )
      //check for tBTC/vBTC contracts
    } else {
      totalLpWethValue = portionLp.times(lpWethWorth).times(new BigNumber(2))
    }
  }
  // Calculate
  const tokenAmount = new BigNumber(tokenAmountWholeLP)
    .times(portionLp)
    .div(new BigNumber(10).pow(tokenDecimals))

  const wethAmount = new BigNumber(lpContractWeth)
    .times(portionLp)
    .div(new BigNumber(10).pow(18))
  return {
    tokenAmount,
    wethAmount,
    totalWethValue: totalLpWethValue.div(new BigNumber(10).pow(18)),
    tokenPriceInWeth: wethAmount.div(tokenAmount),
    poolWeight: await getPoolWeight(masterChefContract, pid),
    multiplier: await getMultiplier(masterChefContract, block, vbtc)
  }
}

export const approve = async (lpContract, masterChefContract, account) => {
  return lpContract.methods
    .approve(masterChefContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account })
}

export const getVbtcSupply = async (vbtc) => {
  return new BigNumber(await vbtc.contracts.vbtc.methods.totalSupply().call())
}

export const getStrudelSupply = async (strudel) => {
  return new BigNumber(
    await strudel.contracts.strudel.methods.totalSupply().call(),
  )
}

export const proofOpReturnAndMint = async (
  vbtcContract,
  account,
  proof,
  burnOutputIndex,
) => {
  return vbtcContract.methods
    .proofOpReturnAndMint(
      proof.header,
      proof.proof,
      proof.version,
      proof.locktime,
      Number(proof.index),
      Number(burnOutputIndex),
      proof.vin,
      proof.vout,
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const stake = async (masterChefContract, pid, amount, account) => {
  return masterChefContract.methods
    .deposit(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const unstake = async (masterChefContract, pid, amount, account) => {
  return masterChefContract.methods
    .withdraw(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}
export const harvest = async (masterChefContract, pid, account) => {
  return masterChefContract.methods
    .deposit(pid, '0')
    .send({ from: account })
    .on('transactionHash', (tx) => {
      //console.log(tx)
      return tx.transactionHash
    })
}

export const getStaked = async (masterChefContract, pid, account) => {
  try {
    const { amount } = await masterChefContract.methods
      .userInfo(pid, account)
      .call()
    return new BigNumber(amount)
  } catch {
    return new BigNumber(0)
  }
}

export const redeem = async (masterChefContract, account) => {
  let now = new Date().getTime() / 1000
  if (now >= 1597172400) {
    return masterChefContract.methods
      .exit()
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert('pool not active')
  }
}
