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
            issuers: [deployAddress],
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
            //0x0139a72438b3428206fb92b3e0b94403d929fbb6a646bfc0b7ec975a6a1a09f0
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
                    _id: updatedTxn._id,
                    collectionId: updatedCollection._id,
                    contractAddress: updatedCollection.contractAddress,
                    chainId: updatedTxn.chainId,
                    transactionHash: updatedTxn.transactionHash,
                    transactionStatus: updatedTxn.status,
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
                collectionId: findCollection._id,
                contractAddress: findCollection.contractAddress,
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
        const { pubKey } = req.params;
        // const { chainId } = req.query;
        // let newtorkId = 5;
        // if(chainId)
        //   newtorkId = Number(chainId);
        const dbReponse = yield db_1.default
            .collection('transactions')
            .aggregate([
            {
                $match: {
                    from: pubKey.toLowerCase(),
                    transactionType: 'DEPLOY',
                    //chainId: newtorkId
                },
            },
            {
                $lookup: {
                    from: 'collections',
                    localField: 'contractAddress',
                    foreignField: 'contractAddress',
                    as: 'collectionInfo',
                },
            },
            {
                $unwind: {
                    path: '$collectionInfo',
                },
            },
            {
                $group: {
                    _id: '$_id',
                    collectionId: { $first: '$collectionInfo._id' },
                    collectioName: { $first: '$collectionInfo.name' },
                    collectioSymbol: { $first: '$collectionInfo.symbol' },
                    contractAddress: { $first: '$collectionInfo.contractAddress' },
                    contractOwner: { $first: '$from' },
                    chainId: { $first: '$chainId' },
                    transactionHash: { $first: '$transactionHash' },
                    transactionStatus: { $first: '$status' },
                    createdOn: { $first: '$collectionInfo.createdOn' },
                },
            },
            { $sort: { createdOn: -1 } },
        ])
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
/*
router.get('/issuers/:collectionId',  async (req: Request, res: Response, next) => {

  try {
   
    const { collectionId } = req.params;

    if(!collectionId)
      return res.status(400).send({ error: "Missing required query parameters" });

    const collectonData = await db
      .collection('contracts')
      .findOne(
        { '_id': new ObjectId(collectionId) },
        {
          projection: {
            _id: 1,
            name: 1,
            issuers: 1
          },
        }
      )

    collectonData.issuers  = [
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000005',
      '0x0000000000000000000000000000000000000006',
      '0x0000000000000000000000000000000000000007',
      '0x0000000000000000000000000000000000000008',
      '0x0000000000000000000000000000000000000009',
      '0x0000000000000000000000000000000000000010',
    ];

    return res.json(collectonData);

  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});

router.put('/issuers',  async (req: Request, res: Response, next) => {

  try {
   
    const { collection_id, new_list} = req.body;

    if(!collection_id || !new_list)
      return res.status(400).send({ error: "Missing required query parameters" });

    const response = await db
      .collection('contracts')
      .findOneAndUpdate(
        { '_id': new ObjectId(collection_id) },
        {
          $set: {
            issuers: new_list
          }
        },
        {
          returnDocument: 'after',
          projection: {
            _id: 1,
            name: 1,
            issuers: 1
          },
        },
      );

    return res.json(response);

  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});
*/
exports.default = router;
