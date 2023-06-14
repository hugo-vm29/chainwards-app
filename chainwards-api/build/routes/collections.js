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
const dappUtils_1 = require("../utils/dappUtils");
const mongodb_1 = require("mongodb");
const dbHelper_1 = require("../utils/dbHelper");
const dappUtils_2 = require("../utils/dappUtils");
/* eslint-disable camelcase */
const router = express_1.default.Router({ mergeParams: true });
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deployAddress, txnHash, chainId, collectionInfo } = req.body;
        const { name, symbol, description } = collectionInfo;
        if (!deployAddress || !txnHash || !chainId || !collectionInfo)
            return res.status(400).send({ error: 'Missing required parameters' });
        const findAccount = yield db_1.default.collection('accounts').findOne({ 'wallet.address': deployAddress }, {
            projection: {
                _id: 1,
                name: 1,
            },
        });
        if (!findAccount)
            return res.status(400).send({ error: 'Deploy address is not valid' });
        const findTxn = yield db_1.default.collection('transactions').findOne({ transactionHash: txnHash }, {
            projection: {
                _id: 1,
            },
        });
        if (findTxn)
            return res.status(400).send({
                error: 'The specified transaction hash is already associated to an existing collection',
            });
        const txnObject = {
            from: deployAddress.toLowerCase(),
            to: '0x0000000000000000000000000000000000000000',
            transactionHash: txnHash,
            chainId: Number(chainId),
            status: 'pending',
            transactionType: 'DEPLOY',
            contractAddress: '',
            timestamp: new Date(),
            //error: "",
        };
        const txnResponse = yield db_1.default.collection('transactions').insertOne(txnObject);
        const collectionObject = {
            name,
            symbol,
            description,
            transactionId: txnResponse.insertedId,
            contractAddress: '',
            status: 'deploying',
            blockIssuers: false,
            createdOn: new Date(),
            owner: deployAddress,
            issuers: [],
        };
        const collectionResponse = yield db_1.default
            .collection('collections')
            .insertOne(collectionObject);
        return res.json({
            transactionId: txnResponse.insertedId,
            transactionStatus: 'pending',
            collectionId: collectionResponse.insertedId,
        });
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
router.get('/transaction/status/:txnId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { txnId } = req.params;
        if (!txnId)
            return res.status(400).send({ error: 'A required parameter is missing' });
        const findTxn = yield db_1.default.collection('transactions').findOne({ _id: new mongodb_1.ObjectId(txnId) }, {
            projection: {
                _id: 1,
                transactionHash: 1,
                chainId: 1,
                status: 1,
            },
        });
        if (!findTxn)
            return res
                .status(400)
                .send({ error: 'No transaction was found for the provided transaction hash.' });
        if (findTxn.status == 'pending') {
            const rpcUrl = (0, dappUtils_1.getRpcEndpoint)(findTxn.chainId);
            (0, dappUtils_1.setProvider)(rpcUrl);
            const txReceipt = yield (0, dappUtils_1.getTransactionReceipt)(findTxn.transactionHash);
            if (txReceipt.status == 1) {
                const queryUpdateTxn = yield db_1.default.collection('transactions').findOneAndUpdate({ _id: new mongodb_1.ObjectId(txnId) }, {
                    $set: {
                        status: 'completed',
                        contractAddress: txReceipt.contractAddress,
                    },
                }, {
                    returnDocument: 'after',
                    projection: {
                        _id: 1,
                        transactionHash: 1,
                        status: 1,
                        chainId: 1,
                    },
                });
                const queryUpdateCollection = yield db_1.default.collection('collections').findOneAndUpdate({ transactionId: new mongodb_1.ObjectId(txnId) }, {
                    $set: {
                        status: 'active',
                        contractAddress: txReceipt.contractAddress,
                    },
                }, {
                    returnDocument: 'after',
                    projection: {
                        _id: 1,
                        contractAddress: 1,
                    },
                });
                const updatedTxn = queryUpdateTxn.value;
                const updatedCollection = queryUpdateCollection.value;
                const responseData = {
                    _id: updatedTxn === null || updatedTxn === void 0 ? void 0 : updatedTxn._id,
                    collectionId: updatedCollection === null || updatedCollection === void 0 ? void 0 : updatedCollection._id,
                    contractAddress: updatedCollection === null || updatedCollection === void 0 ? void 0 : updatedCollection.contractAddress,
                    chainId: updatedTxn === null || updatedTxn === void 0 ? void 0 : updatedTxn.chainId,
                    transactionHash: updatedTxn === null || updatedTxn === void 0 ? void 0 : updatedTxn.transactionHash,
                    transactionStatus: updatedTxn === null || updatedTxn === void 0 ? void 0 : updatedTxn.status,
                };
                return res.json(responseData);
            }
        }
        else {
            const findCollection = yield db_1.default.collection('collections').findOne({ transactionId: new mongodb_1.ObjectId(txnId) }, {
                projection: {
                    _id: 1,
                    contractAddress: 1,
                },
            });
            return res.json({
                _id: findTxn._id,
                collectionId: findCollection === null || findCollection === void 0 ? void 0 : findCollection._id,
                contractAddress: findCollection === null || findCollection === void 0 ? void 0 : findCollection.contractAddress,
                chainId: findTxn.chainId,
                transactionHash: findTxn.transactionHash,
                transactionStatus: findTxn.status,
            });
        }
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
router.get('/findByWallet/:pubKey', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { pubKey } = req.params;
        pubKey = pubKey.toLowerCase();
        const aggregationPipleine = [
            {
                $match: {
                    $or: [{ owner: pubKey }, { issuers: { $in: [pubKey] } }],
                    status: 'active',
                },
            },
            ...(0, dbHelper_1.getCollectionPipeline)(),
        ];
        const dbReponse = yield db_1.default
            .collection('collections')
            .aggregate(aggregationPipleine)
            .toArray();
        if (dbReponse.length == 0)
            return res.json([]);
        return res.json(dbReponse);
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
router.get('/:collectionId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { collectionId } = req.params;
        const aggregationPipleine = [
            {
                $match: {
                    _id: new mongodb_1.ObjectId(collectionId),
                },
            },
            ...(0, dbHelper_1.getCollectionPipeline)(),
        ];
        const dbReponse = yield db_1.default
            .collection('collections')
            .aggregate(aggregationPipleine)
            .toArray();
        if (dbReponse.length === 0)
            return res.status(404).send({ error: 'Collection not found' });
        return res.json(dbReponse[0]);
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
router.get('/:collectionId/tokens/:tokenId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const routeName = 'get/collections/:collectionId/tokens/:tokenId';
    try {
        const { collectionId, tokenId } = req.params;
        const findToken = yield db_1.default.collection('tokens').findOne({
            tokenId: Number(tokenId),
            collectionId: new mongodb_1.ObjectId(collectionId),
        });
        if (!findToken)
            return res.status(400).send({ error: 'Token not found' });
        return res.json(findToken);
    }
    catch (err) {
        console.error(`Error (${routeName}): ${err}`);
        return next(err);
    }
}));
router.get('/issuers/:collectionId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const routeName = 'get/collections/issuers/:collectionId';
    try {
        const { collectionId } = req.params;
        const findCollection = yield db_1.default.collection('collections').findOne({ _id: new mongodb_1.ObjectId(collectionId) }, {
            projection: {
                _id: 1,
                name: 1,
                issuers: 1,
            },
        });
        if (!findCollection)
            return res.status(404).send({ error: 'Collection not found' });
        return res.json(findCollection);
    }
    catch (err) {
        console.error(`Error (${routeName}): ${err}`);
        return next(err);
    }
}));
router.patch('/issuers', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const routeName = 'patch/collections/issuers';
    try {
        /** Save a new list of issuers for the collection AFTER the
         * corresponding roles have been changed on chain (i.e. blockchain transaction have been confirmed)
         * **/
        const { collectionId, newIssuers, from, txnHash } = req.body;
        if (!txnHash)
            return res.status(400).send({ error: 'A transaction hash is required' });
        if (!Array.isArray(newIssuers))
            return res
                .status(400)
                .send({ error: 'Invalid format, expect `newIssuers` to be an array' });
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
            transactionType: 'GRANT_ROLE_BATCH',
            timestamp: new Date(),
        };
        const txnResponse = yield db_1.default.collection('transactions').insertOne(txnObject);
        const newList = (0, dappUtils_2.validateAdressArray)(newIssuers);
        const queryResponse = yield db_1.default.collection('collections').findOneAndUpdate({
            _id: collectionUniqueId,
        }, {
            $set: {
                issuers: newList,
                lastUpdated: new Date(),
                lastUpdateTransaction: txnResponse.insertedId,
            },
        }, {
            returnDocument: 'after',
            projection: {
                _id: 1,
                name: 1,
                issuers: 1,
            },
        });
        const updatedDocument = queryResponse.value;
        return res.json({
            collectionId: updatedDocument === null || updatedDocument === void 0 ? void 0 : updatedDocument._id,
            issuers: updatedDocument === null || updatedDocument === void 0 ? void 0 : updatedDocument.issuers,
        });
    }
    catch (err) {
        console.error(`Error (${routeName}): ${err}`);
        return next(err);
    }
}));
exports.default = router;
