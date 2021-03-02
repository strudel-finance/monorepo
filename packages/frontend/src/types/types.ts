export interface SoChainConfirmedGetTx {
  status: string
  data: {
    blockhash: string
    tx_hex: string
  }
}
export interface LoadingStatus {
  tx: string
  status: boolean
}
export interface Proof {
  header: string
  proof: string
  version: string
  locktime: string
  index: string
  vin: string
  vout: string
}
export interface Confirmation {
  isRelayed?: boolean
  blockHash?: string
  confirmations?: number
  tx_hex?: string
}
export interface Transaction {
  txCreatedAt: Date
  value: string //in BTC not satoshi
  confirmed?: boolean
  btcTxHash?: string
  burnOutputIndex?: string
  ethTxHash?: string
  ethAddress?: string
  proof?: Proof
}
