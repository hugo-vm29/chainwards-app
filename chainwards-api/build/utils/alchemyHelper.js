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
exports.getTransactionReceipt = void 0;
// importing the Alchemy SDK
const alchemy_sdk_1 = require("alchemy-sdk");
const config_1 = __importDefault(require("config"));
const getAlchemyConfig = (chainId) => {
    let network = alchemy_sdk_1.Network.ETH_GOERLI;
    let apiKey = config_1.default.get("goerli_api_key");
    if (chainId == 80001) {
        network = alchemy_sdk_1.Network.MATIC_MUMBAI;
        apiKey = config_1.default.get("mumbai_api_key");
    }
    const alchemySettings = {
        apiKey: apiKey,
        network: network
    };
    return alchemySettings;
};
const getTransactionReceipt = (txHash, chainId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = getAlchemyConfig(chainId);
        const alchemy = new alchemy_sdk_1.Alchemy(settings);
        const txReceipt = yield alchemy.core.getTransactionReceipt(txHash);
        return txReceipt;
    }
    catch (err) {
        return err;
    }
});
exports.getTransactionReceipt = getTransactionReceipt;
