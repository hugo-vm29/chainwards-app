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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMerkleProof = exports.getMerkleRoot = exports.validateAdressArray = exports.stringToAdressArray = exports.validateAddress = exports.getContractWithWallet = exports.getTransactionReceipt = exports.getRpcEndpoint = exports.setProvider = exports.createWallet = void 0;
const ethers_1 = require("ethers");
const merkletreejs_1 = require("merkletreejs");
const constants_1 = require("./constants");
let provider = null;
const createWallet = () => {
    const newWallet = ethers_1.ethers.Wallet.createRandom();
    const walletData = {
        address: newWallet.address.toLocaleLowerCase(),
        signingKey: {
            publicKey: newWallet.publicKey,
            privateKey: newWallet.privateKey,
        },
    };
    return walletData;
};
exports.createWallet = createWallet;
const getNetworkUrl = (chainId) => {
    let networkUrl = '';
    if (chainId == 5) {
        networkUrl = constants_1.RPC_ENDPOINTS.goerli;
    }
    else if (chainId == 80001) {
        networkUrl = constants_1.RPC_ENDPOINTS.mumbai;
    }
    return networkUrl;
};
const getNetworkApiKey = (chainId) => {
    let apiKey = '';
    if (chainId == 5) {
        apiKey = process.env.GOERLI_API_KEY || '';
    }
    else if (chainId == 80001) {
        apiKey = process.env.MUMBAI_API_KEY || '';
    }
    return apiKey;
};
const getProvider = () => {
    if (provider != null)
        return provider;
    throw new ReferenceError('Provider not defined');
};
const setProvider = (uri) => {
    if (!uri || uri === '')
        throw new Error('No uri specified');
    provider = new ethers_1.ethers.JsonRpcProvider(uri);
    return provider;
};
exports.setProvider = setProvider;
const getRpcEndpoint = (chainId) => {
    const networkUrl = getNetworkUrl(chainId);
    const apiKey = getNetworkApiKey(chainId);
    if (networkUrl === '' || apiKey === '')
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
/*** contract interaction ***/
const getWallet = (privateKey) => {
    if (!privateKey)
        throw new ReferenceError('No privateKey provided for getWallet');
    const provider = getProvider();
    return new ethers_1.ethers.Wallet(privateKey, provider);
};
const getContractWithWallet = (contractJson, contractAddr, walletAddr) => __awaiter(void 0, void 0, void 0, function* () {
    const walletAccount = yield getWallet(walletAddr);
    const contractInstance = new ethers_1.ethers.Contract(contractAddr, contractJson.abi, walletAccount);
    //const contract = new ethers.Contract(address, contractJson.abi, provider);
    //const contractWithSigner = contract.connect(signer);
    return contractInstance;
});
exports.getContractWithWallet = getContractWithWallet;
/*** address validation ***/
const validateAddress = (address) => {
    return ethers_1.ethers.isAddress(address);
};
exports.validateAddress = validateAddress;
const stringToAdressArray = (data) => {
    const addresses = data.trim().split(',');
    const whitelist = [];
    addresses.forEach((item) => {
        if (item !== '' && (0, exports.validateAddress)(item)) {
            whitelist.push(item.toLocaleLowerCase());
        }
    });
    return whitelist;
};
exports.stringToAdressArray = stringToAdressArray;
const validateAdressArray = (addressArray) => {
    const filteredArray = addressArray.filter((item) => item !== '' && ethers_1.ethers.isAddress(item));
    return filteredArray;
};
exports.validateAdressArray = validateAdressArray;
/*** merkle trees ***/
const getMerkleRoot = (whitelist) => {
    const leaves = whitelist.map((addr) => ethers_1.ethers.keccak256(addr));
    const merkleTree = new merkletreejs_1.MerkleTree(leaves, ethers_1.ethers.keccak256, { sortPairs: true });
    const merkleRootHash = merkleTree.getHexRoot();
    return merkleRootHash;
};
exports.getMerkleRoot = getMerkleRoot;
const getMerkleProof = (toAddress, whitelist) => {
    const leaves = whitelist.map((addr) => ethers_1.ethers.keccak256(addr));
    const merkleTree = new merkletreejs_1.MerkleTree(leaves, ethers_1.ethers.keccak256, { sortPairs: true });
    const hashedAddress = ethers_1.ethers.keccak256(toAddress);
    const proof = merkleTree.getHexProof(hashedAddress);
    return proof;
};
exports.getMerkleProof = getMerkleProof;
