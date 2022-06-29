const { ethers } = require("hardhat");
const Web3 = require("web3");
const web3 = new Web3();

// You can find Harmony explorers here
// https://docs.harmony.one/home/developers/network-and-faucets#block-explorers

// $yarn hardhat run --network localhost scripts/trasnfer_ownership_and_minter.js
// $yarn hardhat run --network harmony_testnet scripts/trasnfer_ownership_and_minter.js
// $yarn hardhat run --network harmony_mainnet scripts/trasnfer_ownership_and_minter.js
// Use this after deploy/001_deploy_tokens.ts
async function main() {
    // Call 1, 2, 3 separately
    // Harmony mainnet
    const deployer = "0x7C02f951B3036E96024FB4335142E704cA7BDBeA";

    const OwnerLock = "0xEA07B1a39C694Dbef422E04b8C7E8E66A1D87b8b";
    // const OwnerLock = "0xF58b8839584aCFAAfa597E7F36c7CEd69364a1fe";
    // const AdminLock = "0xf66df6bc0D211DA57697400aD1bE7d4960CE4c85";

    const VBTC = "0xDb29b395e5E216593C406D9ecC3222580c636Fd4";
    const STRUDEL = "0x8a3937950BF912c1680b7366DB4D1731E45F7fAA"; 
    
    let VBTCToken = await ethers.getContractFactory("VbtcToken");
    VBTCToken = await VBTCToken.attach(
        VBTC
    );

    let StrudelToken = await ethers.getContractFactory("StrudelToken");
    StrudelToken = await StrudelToken.attach(
        STRUDEL,
    );

    // 1. Done
    const addMinterTx = await StrudelToken.addMinter(VBTC);
    await addMinterTx.wait();
    console.log("VBTC is a Strudel Minter");
    console.log(await StrudelToken.isMinter(VBTC));

    // Should be done later
    // 2.
    // const vbtcTransferOwnershipTx = await VBTCToken.transferOwnership(OwnerLock);
    // await vbtcTransferOwnershipTx.wait();

    // 2.
    // const currentVbtcOwner = await VBTCToken.owner();
    // console.log("currentVbtcOwner");
    // console.log(currentVbtcOwner); // 0xF58b8839584aCFAAfa597E7F36c7CEd69364a1fe

    // Should be done later
    // // 3.
    // // const strudelTransferOwnershipTx = await StrudelToken.transferOwnership(OwnerLock);
    // // await strudelTransferOwnershipTx.wait();
    // const currentStrudelOwner = await StrudelToken.owner();
    // console.log("currentStrudelOwner");
    // console.log(currentStrudelOwner); // 0xF58b8839584aCFAAfa597E7F36c7CEd69364a1fe
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });