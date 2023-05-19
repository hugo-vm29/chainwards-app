"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionReceipt = exports.getRpcEndpoint = exports.setProvider = exports.createWallet = void 0;
const config_1 = __importDefault(require("config"));
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
let provider = null;
const createWallet = () => {
    const newWallet = ethers_1.ethers.Wallet.createRandom();
    const walletData = {
        address: newWallet.address.toLocaleLowerCase(),
        signingKey: {
            publicKey: newWallet.publicKey,
            privateKey: newWallet.privateKey,
        }
    };
    return walletData;
};
exports.createWallet = createWallet;
const getNetworkUrl = (chainId) => {
    let networkUrl = "";
    if (chainId == 5) {
        networkUrl = constants_1.RPC_ENDPOINTS.goerli;
    }
    else if (chainId == 80001) {
        networkUrl = constants_1.RPC_ENDPOINTS.mumbai;
    }
    return networkUrl;
};
const getNetworkApiKey = (chainId) => {
    let apiKey = "";
    if (chainId == 5) {
        apiKey = config_1.default.get("goerli_api_key");
    }
    else if (chainId == 80001) {
        apiKey = config_1.default.get("mumbai_api_key");
    }
    return apiKey;
};
const getProvider = () => {
    if (provider != null)
        return provider;
    throw new ReferenceError('Provider not defined');
};
const setProvider = (uri) => {
    if (!uri || uri === "")
        throw new Error('No uri specified');
    provider = new ethers_1.ethers.JsonRpcProvider(uri);
    return provider;
};
exports.setProvider = setProvider;
const getRpcEndpoint = (chainId) => {
    let networkUrl = getNetworkUrl(chainId);
    let apiKey = getNetworkApiKey(chainId);
    if (networkUrl === "" || apiKey === "")
        throw new Error('RPC url not found');
    return `${networkUrl}/${apiKey}`;
};
exports.getRpcEndpoint = getRpcEndpoint;
const getTransactionReceipt = (txHash) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = getProvider();
    const txReceipt = yield provider.getTransactionReceipt(txHash);
    return txReceipt;
});
exports.getTransactionReceipt = getTransactionReceipt;
// const getAlchemyConfig = (chainId: number) => {
//   let network = Network.ETH_GOERLI;
//   let apiKey =  config.get<string>("goerli_api_key");
//   if(chainId == 80001){
//     network = Network.MATIC_MUMBAI;
//     apiKey = config.get("mumbai_api_key");
//   }
//   const alchemySettings = {
//     apiKey: apiKey,
//     network: network
//   }
//   return alchemySettings;
// }
// export const getTransactionReceipt = async(txHash: string, chainId: number) => {
//   try{
//     const settings = getAlchemyConfig(chainId);
//     const alchemy = new Alchemy(settings);
//     const txReceipt = await alchemy.core.getTransactionReceipt(txHash);
//     return txReceipt;
//   }catch(err){
//     return err;
//   }
// }
