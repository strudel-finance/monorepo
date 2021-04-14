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

interface Transaction  {
  txCreatedAt: Date
  value: string //in BTC not satoshi
  confirmed?: boolean
  burnOutputIndex?: string
  ethTxHash?: string
  ethAddress?: string
  proof?: Proof
}
export interface BTCTransaction extends Transaction {
  btcTxHash?: string
}

export interface BCHTransaction extends Transaction{
  bchTxHash?: string
}

interface Burns {
  amount: string // satoshis
  dateCreated: Date
  status: string
  burnOutputIndex: string
  ethTxHash?: string
}

interface BCHBurns extends Burns {
  bchTxHash: string
}

interface BTCBurns extends Burns {
  btcTxHash: string
}
export interface AccountRequest {
  account: string
  burns: BTCBurns[]
  bchBurns: BCHBurns[]
}