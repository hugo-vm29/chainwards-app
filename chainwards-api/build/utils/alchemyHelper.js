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
exports.getTokensForOwner = void 0;
const alchemy_sdk_1 = require("alchemy-sdk");
const getAlchemySettings = (chainId) => {
    let settings;
    if (chainId == 5) {
        settings = {
            apiKey: process.env.GOERLI_API_KEY || '',
            network: alchemy_sdk_1.Network.ETH_GOERLI,
        };
    }
    else if (chainId == 80001) {
        settings = {
            apiKey: process.env.MUMBAI_API_KEY || '',
            network: alchemy_sdk_1.Network.MATIC_MUMBAI,
        };
    }
    return settings;
};
const getTokensForOwner = (walletAddress, chainId, distinctContracts) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = getAlchemySettings(chainId);
    if ((settings === null || settings === void 0 ? void 0 : settings.apiKey) === '')
        throw new Error('Missing keys for node provider');
    const alchemy = new alchemy_sdk_1.Alchemy(settings);
    const nftsForOwner = yield alchemy.nft.getNftsForOwner(walletAddress, {
        contractAddresses: distinctContracts,
    });
    return nftsForOwner;
});
exports.getTokensForOwner = getTokensForOwner;
