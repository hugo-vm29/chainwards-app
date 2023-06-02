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
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const config_1 = __importDefault(require("config"));
const multer_1 = __importDefault(require("multer"));
const nft_storage_1 = require("nft.storage");
const dappUtils_1 = require("../utils/dappUtils");
const mongodb_1 = require("mongodb");
const memStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: memStorage });
/* eslint-disable camelcase */
const router = express_1.default.Router({ mergeParams: true });
const endpoint = 'https://api.nft.storage';
router.post('/metadata/upload', upload.single('file'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).send({ error: 'Image is required' });
        const storageServiceKey = config_1.default.get('nft_storage_key');
        if (!storageServiceKey)
            return res
                .status(500)
                .send({ error: 'Server is unable to upload metadata, missing key' });
        const { name, description, attributes, claimers } = req.body;
        const fileData = req.file.buffer;
        /** ERC-1155 Metadata **/
        const formattedItems = JSON.parse(attributes);
        const additonalAttributes = [];
        //additional attibutes
        formattedItems.forEach((item) => {
            additonalAttributes.push({
                trait_type: item.key,
                value: item.value,
            });
        });
        //console.log("additonalAttributes", additonalAttributes);
        const newFile = new nft_storage_1.File([fileData], req.file.originalname, {
            type: req.file.mimetype,
        });
        const tokenMetadata = {
            image: newFile,
            name: name,
            description: description,
            attributes: additonalAttributes,
        };
        /** Compute merkle root hash with claimers (whitelisting functionality) **/
        const whitelist = (0, dappUtils_1.stringToAdressArray)(claimers);
        const merkleRoot = (0, dappUtils_1.getMerkleRoot)(whitelist);
        const client = new nft_storage_1.NFTStorage({
            endpoint: new URL(endpoint),
            token: storageServiceKey,
        });
        const serviceResponse = yield client.store(tokenMetadata);
        const tokenURI = serviceResponse.url.replace('ipfs://', '');
        return res.json({
            tokenURI: tokenURI,
            merkleRoot: merkleRoot,
        });
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const routeName = { logSource: 'post/tokens' };
    try {
        const { tokenId, issuer, contract, txnHash, chainId, claimers } = req.body;
        const findCollection = yield db_1.default.collection('collections').findOne({ contractAddress: contract }, {
            projection: {
                _id: 1,
                name: 1,
            },
        });
        if (!findCollection)
            return res
                .status(400)
                .send({ error: 'No collection was found for the provided address' });
        const txnObject = {
            from: issuer.toLowerCase(),
            to: contract,
            transactionHash: txnHash,
            chainId: Number(chainId),
            status: 'completed',
            transactionType: 'ISSUE',
            timestamp: new Date(),
        };
        const txnResponse = yield db_1.default.collection('transactions').insertOne(txnObject);
        const addresses = claimers.trim().split(',');
        const whitelist = [];
        addresses.forEach((item) => {
            if (item !== '' && (0, dappUtils_1.validateAddress)(item)) {
                whitelist.push(item.toLocaleLowerCase());
            }
        });
        const tokenObject = {
            tokenId: tokenId,
            transactionId: txnResponse.insertedId,
            collectionId: findCollection._id,
            whitelist: whitelist,
            claimable: true,
            chainId: Number(chainId),
            createdOn: new Date(),
            lastUpdated: new Date(),
            lastUpdateTransaction: txnResponse.insertedId,
        };
        yield db_1.default.collection('tokens').insertOne(tokenObject);
        return res.json({
            tokenId: tokenId,
            transactionId: txnResponse.insertedId,
            collectionId: tokenObject.collectionId,
        });
    }
    catch (err) {
        console.error(`Error (${routeName}): ${err}`);
        return next(err);
    }
}));
router.patch('/claimers', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const routeName = 'patch/tokens/claimers';
    try {
        /** Save a new list of claimers for a token AFTER the
         * corresponding merkle root have been change on chain (i.e. blockchain transaction have been confirmed)
         * **/
        const { tokenId, collectionId, newClaimers, from, txnHash } = req.body;
        if (!txnHash)
            return res.status(400).send({ error: 'A transaction hash is required' });
        const collectionUniqueId = new mongodb_1.ObjectId(collectionId);
        const findCollection = yield db_1.default.collection('collections').findOne({ _id: collectionUniqueId }, {
            projection: {
                _id: 1,
                contractAddress: 1,
            },
        });
        if (!findCollection)
            return res.status(404).send({ error: 'Collection not found' });
        const txnObject = {
            from: from.toLowerCase(),
            to: findCollection.contractAddress,
            transactionHash: txnHash,
            status: 'completed',
            transactionType: 'SET_MERKLE_ROOT',
            timestamp: new Date(),
        };
        const txnResponse = yield db_1.default.collection('transactions').insertOne(txnObject);
        const whitelist = (0, dappUtils_1.stringToAdressArray)(newClaimers);
        const queryResponse = yield db_1.default.collection('tokens').findOneAndUpdate({
            tokenId: Number(tokenId),
            collectionId: collectionUniqueId,
        }, {
            $set: {
                whitelist: whitelist,
                lastUpdated: new Date(),
                lastUpdateTransaction: txnResponse.insertedId,
            },
        }, {
            returnDocument: 'after',
            projection: {
                tokenId: 1,
                whitelist: 1,
            },
        });
        const updatedDocument = queryResponse.value;
        return res.json({
            tokenId: updatedDocument === null || updatedDocument === void 0 ? void 0 : updatedDocument.tokenId,
            collectionId: collectionUniqueId,
            whitelist: updatedDocument === null || updatedDocument === void 0 ? void 0 : updatedDocument.whitelist,
        });
    }
    catch (err) {
        console.error(`Error (${routeName}): ${err}`);
        return next(err);
    }
}));
exports.default = router;
