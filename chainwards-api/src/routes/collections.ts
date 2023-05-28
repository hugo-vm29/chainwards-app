import express, { Request, Response } from 'express';
import db from '../db';
import { setProvider, getRpcEndpoint, getTransactionReceipt } from '../utils/dappUtils';
import { ObjectId } from 'mongodb';

/* eslint-disable camelcase */
const router = express.Router({ mergeParams: true });

router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { deployAddress, txnHash, chainId, collectionInfo } = req.body;
    const { name, symbol, description } = collectionInfo;

    if (!deployAddress || !txnHash || !chainId || !collectionInfo)
      return res.status(400).send({ error: 'Missing required parameters' });

    const findAccount = await db.collection('accounts').findOne(
      { 'wallet.address': deployAddress },
      {
        projection: {
          _id: 1,
          name: 1,
        },
      },
    );

    if (!findAccount)
      return res.status(400).send({ error: 'Deploy address is not valid' });

    const findTxn = await db.collection('transactions').findOne(
      { transactionHash: txnHash },
      {
        projection: {
          _id: 1,
        },
      },
    );

    if (findTxn)
      return res.status(400).send({
        error:
          'The specified transaction hash is already associated to an existing collection',
      });

    const txnObject = {
      from: deployAddress.toLowerCase(), //owner's address,
      to: '0x0000000000000000000000000000000000000000',
      transactionHash: txnHash,
      chainId: Number(chainId),
      status: 'pending',
      transactionType: 'DEPLOY',
      contractAddress: '',
      timestamp: new Date(),
      //error: "",
    };

    const txnResponse = await db.collection('transactions').insertOne(txnObject);

    const collectionObject = {
      name,
      symbol,
      description,
      transactionId: txnResponse.insertedId,
      contractAddress: '',
      status: 'deploying', //active
      blockIssuers: false,
      createdOn: new Date(),
      issuers: [deployAddress],
    };

    const collectionResponse = await db
      .collection('collections')
      .insertOne(collectionObject);

    return res.json({
      transactionId: txnResponse.insertedId,
      transactionStatus: 'pending',
      collectionId: collectionResponse.insertedId,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});

router.get('/transaction/status/:txnId', async (req: Request, res: Response, next) => {
  try {
    const { txnId } = req.params;

    if (!txnId) return res.status(400).send({ error: 'A required parameter is missing' });

    const findTxn = await db.collection('transactions').findOne(
      { _id: new ObjectId(txnId) },
      {
        projection: {
          _id: 1,
          transactionHash: 1,
          chainId: 1,
          status: 1,
        },
      },
    );

    if (!findTxn)
      return res
        .status(400)
        .send({ error: 'No transaction was found for the provided transaction hash.' });

    if (findTxn.status == 'pending') {
      //0x0139a72438b3428206fb92b3e0b94403d929fbb6a646bfc0b7ec975a6a1a09f0
      const rpcUrl = getRpcEndpoint(findTxn.chainId);
      setProvider(rpcUrl);
      const txReceipt: any = await getTransactionReceipt(findTxn.transactionHash);

      if (txReceipt.status == 1) {
        const queryUpdateTxn = await db.collection('transactions').findOneAndUpdate(
          { _id: new ObjectId(txnId) },
          {
            $set: {
              status: 'completed',
              contractAddress: txReceipt.contractAddress,
            },
          },
          {
            returnDocument: 'after',
            projection: {
              _id: 1,
              transactionHash: 1,
              status: 1,
              chainId: 1,
            },
          },
        );

        const queryUpdateCollection = await db.collection('collections').findOneAndUpdate(
          { transactionId: new ObjectId(txnId) },
          {
            $set: {
              status: 'active',
              contractAddress: txReceipt.contractAddress,
            },
          },
          {
            returnDocument: 'after',
            projection: {
              _id: 1,
              contractAddress: 1,
            },
          },
        );

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
    } else {
      const findCollection = await db.collection('collections').findOne(
        { transactionId: new ObjectId(txnId) },
        {
          projection: {
            _id: 1,
            contractAddress: 1,
          },
        },
      );

      return res.json({
        _id: findTxn._id,
        collectionId: findCollection._id,
        contractAddress: findCollection.contractAddress,
        chainId: findTxn.chainId,
        transactionHash: findTxn.transactionHash,
        transactionStatus: findTxn.status,
      });
    }
  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});

router.get('/findByWallet/:pubKey', async (req: Request, res: Response, next) => {
  try {
    const { pubKey } = req.params;

    const dbReponse = await db
      .collection('transactions')
      .aggregate([
        {
          $match: {
            from: pubKey.toLowerCase(),
            transactionType: 'DEPLOY',
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
          $match: {
            'collectionInfo.status': { $ne: 'obsolete' },
          },
        },
        {
          $group: {
            _id: '$_id',
            collectionId: { $first: '$collectionInfo._id' },
            collectionName: { $first: '$collectionInfo.name' },
            collectionSymbol: { $first: '$collectionInfo.symbol' },
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

    if (dbReponse.length == 0) return res.json([]);

    return res.json(dbReponse);
  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});

router.get('/:collectionId', async (req: Request, res: Response, next) => {
  try {
    const { collectionId } = req.params;

    const dbReponse = await db
      .collection('collections')
      .aggregate([
        {
          $match: {
            _id: new ObjectId(collectionId),
          },
        },
        {
          $lookup: {
            from: 'transactions',
            localField: 'transactionId',
            foreignField: '_id',
            as: 'transactionInfo',
          },
        },
        {
          $unwind: {
            path: '$transactionInfo',
          },
        },
        {
          $group: {
            _id: '$_id',
            collectionName: { $first: '$name' },
            collectiondescription: { $first: '$description' },
            collectionSymbol: { $first: '$symbol' },
            contractAddress: { $first: '$contractAddress' },
            contractOwner: { $first: '$transactionInfo.from' },
            chainId: { $first: '$transactionInfo.chainId' },
            collectionStatus: { $first: '$status' },
            blockIssuers: { $first: '$blockIssuers' },
            transactionHash: { $first: '$transactionInfo.transactionHash' },
            createdOn: { $first: '$createdOn' },
          },
        },
      ])
      .toArray();

    if (dbReponse.length === 0)
      return res.status(404).send({ error: 'Collection not found' });

    return res.json(dbReponse[0]);
  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});

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

export default router;
