import { Contracts } from './contracts'

export class Account {
  contracts: Contracts
  accountInfo: string
  type: string
  allocation: any[]
  balances: {}
  status: string
  approvals: {}
  walletInfo: {}

  constructor(contracts: Contracts, address: string) {
    this.contracts = contracts
    this.accountInfo = address
    this.type = ''
    this.allocation = []
    this.balances = {}
    this.status = ''
    this.approvals = {}
    this.walletInfo = {}
  }
}
