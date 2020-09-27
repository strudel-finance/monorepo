import { encode } from 'bech32';

const PREFIX = "ffffffffffff"; // prefix and suffix to be added when encoding to p2wsh address 
const POSTFIX = "ffffffffffff";// not used otherwise
const HRP = 'bc';
const URI_PREFIX = 'bitcoin:';

const addrToProgram = (addr: string) => {
    const re = /[0-9A-Fa-f]{2}/gi;
    const tokens = (addr.match(re)); //split string to array
    const program = tokens.map(t => parseInt(t, 16)); //convert hex numbers in string array to dec
    return program;    
}

export function getBtcAddress (ethAddress: string, isP2WSH=true) {
    if (ethAddress.charAt(1) == 'x') ethAddress = ethAddress.substring(2);
    
    if (ethAddress.length != 40) return "Error: Wrong Ethereum address format";
    
    if (isP2WSH) ethAddress = PREFIX + ethAddress + POSTFIX;
    
    const program = addrToProgram(ethAddress);
    let progLength = 20;
    if (isP2WSH) progLength = 32;
    if ((program.length != progLength)) return "Error: Wrong Ethereum address format";
    
    const btcAddress = encode(HRP, program);
    return btcAddress;
}

export function getBtcUri (ethAddress: string, amount: string, isP2WSH=true) {
    const btcAddress = getBtcAddress(ethAddress, isP2WSH);
    if (btcAddress == "Error: Wrong Ethereum address format") return btcAddress;
    return URI_PREFIX.concat(btcAddress,"?amount=",amount);
}
