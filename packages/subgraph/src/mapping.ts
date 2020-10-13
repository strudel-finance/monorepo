import { BigInt, Address, log, Call } from "@graphprotocol/graph-ts"

import {
  Contract,
  Approval,
  Crossing,
  FlashMint,
  OwnershipTransferred,
  Transfer
} from "../generated/Contract/Contract"
import { Crossings } from "../generated/schema"

export function handleApproval(event: Approval): void {
}

export function handleCrossing(call: Call): void {

    let id = call.transaction.hash.toHexString()

    let crossing = new Crossings(id)

    crossing.ethTxHash = id
    crossing.btcTxHash = call.inputValues[0].toHexString()
    // BigInt and BigDecimal math are supported
    crossing.amount =  event.params.amount

    log.info("Crossing called", [id])
    // Entities can be written to the store with `.save()`
    crossing.save()

}

export function handleFlashMint(event: FlashMint): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransfer(event: Transfer): void {
  if event.
}
