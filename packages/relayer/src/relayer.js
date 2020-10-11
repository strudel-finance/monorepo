const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const ethers = require("ethers");
const RelayerHandler = require("./relayerHandler");
const request = require("request");
const { PoorManRpc } = require("./utils/poorManRpc");

exports.handler = async (event, context) => {
  const providerUrl = process.env.PROVIDER_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const bclient = new PoorManRpc(
    request,
    process.env.BCD_USERNAME,
    process.env.BCD_PASSWORD,
    process.env.BCD_RPC,
    process.env.BCD_PORT
  );

  const service = new RelayerHandler(provider, bclient, wallet);
  return await service.updateBlockHeader();
};
