import express, { Request, Response } from 'express';
import db from '../db';
import { setProvider, getRpcEndpoint, getTransactionReceipt } from '../utils/dappUtils';
import { ObjectId } from 'mongodb';
import { getCollectionPipeline } from '../utils/dbHelper';
import { validateAdressArray } from '../utils/dappUtils';

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
      chainId: Number(chainId),
      status: 'deploying', //active
      blockIssuers: false,
      createdOn: new Date(),
      owner: deployAddress,
      issuers: [],
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
          _id: updatedTxn?._id,
          collectionId: updatedCollection?._id,
          contractAddress: updatedCollection?.contractAddress,
          chainId: updatedTxn?.chainId,
          transactionHash: updatedTxn?.transactionHash,
          transactionStatus: updatedTxn?.status,
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
        collectionId: findCollection?._id,
        contractAddress: findCollection?.contractAddress,
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
    let { pubKey } = req.params;
    pubKey = pubKey.toLowerCase();

    const aggregationPipleine = [
      {
        $match: {
          $or: [{ owner: pubKey }, { issuers: { $in: [pubKey] } }],
          //status: 'active',
        },
      },
      ...getCollectionPipeline(),
    ];

    const dbReponse = await db
      .collection('collections')
      .aggregate(aggregationPipleine)
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

    const aggregationPipleine = [
      {
        $match: {
          _id: new ObjectId(collectionId),
        },
      },
      ...getCollectionPipeline(),
    ];

    const dbReponse = await db
      .collection('collections')
      .aggregate(aggregationPipleine)
      .toArray();

    if (dbReponse.length === 0)
      return res.status(404).send({ error: 'Collection not found' });

    return res.json(dbReponse[0]);
  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});

router.get(
  '/:collectionId/tokens/:tokenId',
  async (req: Request, res: Response, next) => {
    const routeName = 'get/collections/:collectionId/tokens/:tokenId';

    try {
      const { collectionId, tokenId } = req.params;

      const findToken = await db.collection('tokens').findOne({
        tokenId: Number(tokenId),
        collectionId: new ObjectId(collectionId),
      });

      if (!findToken) return res.status(400).send({ error: 'Token not found' });

      return res.json(findToken);
    } catch (err) {
      console.error(`Error (${routeName}): ${err}`);
      return next(err);
    }
  },
);

router.get('/issuers/:collectionId', async (req: Request, res: Response, next) => {
  const routeName = 'get/collections/issuers/:collectionId';

  try {
    const { collectionId } = req.params;

    const findCollection = await db.collection('collections').findOne(
      { _id: new ObjectId(collectionId) },
      {
        projection: {
          _id: 1,
          name: 1,
          issuers: 1,
        },
      },
    );

    if (!findCollection) return res.status(404).send({ error: 'Collection not found' });

    return res.json(findCollection);
  } catch (err: any) {
    console.error(`Error (${routeName}): ${err}`);
    return next(err);
  }
});

router.patch('/issuers', async (req: Request, res: Response, next) => {
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

    const collectionUniqueId = new ObjectId(collectionId);

    const findCollection = await db.collection('collections').findOne(
      { _id: collectionUniqueId },
      {
        projection: {
          _id: 1,
          contractAddress: 1,
        },
      },
    );

    if (!findCollection) return res.status(404).send({ error: 'Collection not found' });

    const txnObject = {
      from: from.toLowerCase(),
      to: findCollection.contractAddress,
      transactionHash: txnHash,
      status: 'completed',
      transactionType: 'GRANT_ROLE_BATCH',
      timestamp: new Date(),
    };

    const txnResponse = await db.collection('transactions').insertOne(txnObject);
    const newList = validateAdressArray(newIssuers);

    const queryResponse = await db.collection('collections').findOneAndUpdate(
      {
        _id: collectionUniqueId,
      },
      {
        $set: {
          issuers: newList,
          lastUpdated: new Date(),
          lastUpdateTransaction: txnResponse.insertedId,
        },
      },
      {
        returnDocument: 'after',
        projection: {
          _id: 1,
          name: 1,
          issuers: 1,
        },
      },
    );

    const updatedDocument = queryResponse.value;

    return res.json({
      collectionId: updatedDocument?._id,
      issuers: updatedDocument?.issuers,
    });
  } catch (err: any) {
    console.error(`Error (${routeName}): ${err}`);
    return next(err);
  }
});

export default router;
