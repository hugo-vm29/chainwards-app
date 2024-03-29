import express, { Request, Response } from 'express';
import db from '../db';
import multer from 'multer';
import { NFTStorage, File as NftFile } from 'nft.storage';
import * as types from '../utils/types';
import {
  validateAddress,
  getMerkleRoot,
  stringToAdressArray,
  getMerkleProof,
  getRpcEndpoint,
  setProvider,
  getContractWithWallet,
} from '../utils/dappUtils';
import { ObjectId } from 'mongodb';
import RewardsContract from '../contracts/Rewards.json';
import { getTokensForOwner } from '../utils/alchemyHelper';
import { getDistinctContractsForOwner } from '../utils/dbHelper';
import { OwnedNft } from 'alchemy-sdk';

const memStorage = multer.memoryStorage();
const upload = multer({ storage: memStorage });

/* eslint-disable camelcase */
const router = express.Router({ mergeParams: true });

const endpoint = 'https://api.nft.storage';

router.post(
  '/metadata/upload',
  upload.single('file'),
  async (req: Request, res: Response, next) => {
    try {
      if (!req.file) return res.status(400).send({ error: 'Image is required' });

      const storageServiceKey = process.env.NFT_STORAGE_TOKEN;

      if (!storageServiceKey)
        return res
          .status(500)
          .send({ error: 'Server is unable to upload metadata, missing key' });

      const { name, description, attributes, claimers } = req.body;
      const fileData: Buffer = req.file.buffer;

      /** ERC-1155 Metadata **/

      const formattedItems = JSON.parse(attributes);
      const additonalAttributes: types.TokenTraits[] = [];

      //additional attibutes
      formattedItems.forEach((item: types.KeyValueItem) => {
        additonalAttributes.push({
          trait_type: item.key,
          value: item.value,
        });
      });

      //console.log("additonalAttributes", additonalAttributes);

      const newFile = new NftFile([fileData], req.file.originalname, {
        type: req.file.mimetype,
      });

      const tokenMetadata = {
        image: newFile,
        name: name,
        description: description,
        attributes: additonalAttributes,
      };

      /** Compute merkle root hash with claimers (whitelisting functionality) **/
      const whitelist = stringToAdressArray(claimers);
      const merkleRoot = getMerkleRoot(whitelist);

      const client = new NFTStorage({
        endpoint: new URL(endpoint),
        token: storageServiceKey,
      });
      const serviceResponse = await client.store(tokenMetadata);
      const tokenURI = serviceResponse.url.replace('ipfs://', '');

      return res.json({
        tokenURI: tokenURI,
        merkleRoot: merkleRoot,
      });
    } catch (err) {
      console.error(`Error: ${err}`);
      return next(err);
    }
  },
);

router.post('/', async (req: Request, res: Response, next) => {
  const routeName = { logSource: 'post/tokens' };

  try {
    const { tokenId, issuer, contract, txnHash, chainId, claimers } = req.body;

    const findCollection = await db.collection('collections').findOne(
      { contractAddress: contract },
      {
        projection: {
          _id: 1,
          name: 1,
        },
      },
    );

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

    const txnResponse = await db.collection('transactions').insertOne(txnObject);

    const addresses = claimers.trim().split(',');
    const whitelist: string[] = [];

    addresses.forEach((item: string) => {
      if (item !== '' && validateAddress(item)) {
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

    await db.collection('tokens').insertOne(tokenObject);

    return res.json({
      tokenId: tokenId,
      transactionId: txnResponse.insertedId,
      collectionId: tokenObject.collectionId,
    });
  } catch (err) {
    console.error(`Error (${routeName}): ${err}`);
    return next(err);
  }
});

router.patch('/claimers', async (req: Request, res: Response, next) => {
  const routeName = 'patch/tokens/claimers';

  try {
    /** Save a new list of claimers for a token AFTER the
     * corresponding merkle root have been change on chain (i.e. blockchain transaction have been confirmed)
     * **/

    const { tokenId, collectionId, newClaimers, from, txnHash } = req.body;

    if (!txnHash)
      return res.status(400).send({ error: 'A transaction hash is required' });

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
      transactionType: 'SET_MERKLE_ROOT',
      timestamp: new Date(),
    };

    const txnResponse = await db.collection('transactions').insertOne(txnObject);
    const whitelist = stringToAdressArray(newClaimers);

    const queryResponse = await db.collection('tokens').findOneAndUpdate(
      {
        tokenId: Number(tokenId),
        collectionId: collectionUniqueId,
      },
      {
        $set: {
          whitelist: whitelist,
          lastUpdated: new Date(),
          lastUpdateTransaction: txnResponse.insertedId,
        },
      },
      {
        returnDocument: 'after',
        projection: {
          tokenId: 1,
          whitelist: 1,
        },
      },
    );

    const updatedDocument = queryResponse.value;

    return res.json({
      tokenId: updatedDocument?.tokenId,
      collectionId: collectionUniqueId,
      whitelist: updatedDocument?.whitelist,
    });
  } catch (err: any) {
    console.error(`Error (${routeName}): ${err}`);
    return next(err);
  }
});

router.get('/toClaim/:pubKey', async (req: Request, res: Response, next) => {
  const routeName = 'get/tokens/toClaim/:pubKey';

  try {
    let { pubKey } = req.params;
    pubKey = pubKey.toLowerCase();

    const mongoPipeline = [
      {
        $match: {
          whitelist: { $in: [pubKey] },
          claimable: true,
        },
      },
      {
        $lookup: {
          from: 'collections',
          localField: 'collectionId',
          foreignField: '_id',
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
          'collectionInfo.status': 'active',
        },
      },
      {
        $project: {
          _id: 1,
          tokenId: 1,
          //whitelist: 1,
          chainId: 1,
          'collectionInfo._id': 1,
          'collectionInfo.name': 1,
          'collectionInfo.contractAddress': 1,
        },
      },
    ];

    const dbReponse = await db.collection('tokens').aggregate(mongoPipeline).toArray();

    const claimedTokens = await db
      .collection('tokenHistory')
      .find({
        owner: pubKey,
      })
      .toArray();

    const completeData = dbReponse.reduce((result: any, item: any) => {
      const findItem = claimedTokens.find(
        (x) =>
          x.tokenId === item.tokenId && x.collectionId.equals(item.collectionInfo._id),
      );
      if (!findItem) {
        result.push(item);
      }
      return result;
    }, []);

    return res.json(completeData);
  } catch (err: any) {
    console.error(`Error (${routeName}): ${err}`);
    return next(err);
  }
});

router.post('/mint', async (req: Request, res: Response, next) => {
  const routeName = 'post/tokens/mint';
  let mintTransactionId;

  try {
    const { tokenId, collectionId, addressTo } = req.body;

    /** validations **/

    const findCollection = await db.collection('collections').findOne(
      {
        _id: new ObjectId(collectionId),
      },
      {
        projection: {
          _id: 1,
          contractAddress: 1,
          owner: 1,
        },
      },
    );

    if (!findCollection)
      return res.status(400).send({ error: 'Collection is not valid' });

    const findToken = await db.collection('tokens').findOne(
      {
        tokenId: Number(tokenId),
        collectionId: new ObjectId(collectionId),
      },
      {
        projection: {
          _id: 1,
          whitelist: 1,
          chainId: 1,
        },
      },
    );

    if (!findToken) return res.status(400).send({ error: 'Token is not valid' });

    /** SEND blockchain transaction **/

    const findOwner = await db.collection('accounts').findOne(
      {
        'wallet.address': findCollection.owner,
      },
      {
        projection: {
          _id: 1,
          wallet: 1,
        },
      },
    );

    if (!findOwner)
      return res
        .status(400)
        .send({ error: 'Unable to mint token due to missing admin wallet' });

    if (!findToken.whitelist.includes(addressTo.toLowerCase()))
      return res
        .status(400)
        .send({ error: 'The destination address is not allowed to mint the token' });

    const rpcUrl = getRpcEndpoint(findToken.chainId);
    setProvider(rpcUrl);

    const walletPvtKey = findOwner.wallet.signingKey.privateKey;
    const merkleProof = await getMerkleProof(addressTo, findToken.whitelist);
    const contractInstance = await getContractWithWallet(
      RewardsContract,
      findCollection.contractAddress,
      walletPvtKey,
    );
    const onChainTxn = await contractInstance.mint(addressTo, tokenId, merkleProof);

    const txnObject = {
      from: findOwner.wallet.address,
      to: findCollection.contractAddress,
      transactionHash: onChainTxn.hash,
      chainId: Number(findToken.chainId),
      status: 'pending',
      transactionType: 'MINT',
      timestamp: new Date(),
    };

    const dbInsertTxn = await db.collection('transactions').insertOne(txnObject);
    mintTransactionId = new ObjectId(dbInsertTxn.insertedId);
    const txReceipt = await onChainTxn.wait();

    /** blockchain transaction MINTED **/

    await db.collection('transactions').findOneAndUpdate(
      { _id: mintTransactionId },
      {
        $set: {
          status: txReceipt.status === 1 ? 'completed' : 'failed',
        },
      },
      {
        returnDocument: 'after',
        projection: {
          _id: 1,
          transactionHash: 1,
        },
      },
    );

    const tokenHistory = {
      tokenId: tokenId,
      collectionId: findCollection._id,
      mintTransaction: mintTransactionId,
      owner: addressTo.toLowerCase(),
      claimedOn: new Date(),
    };

    await db.collection('tokenHistory').insertOne(tokenHistory);

    const responseData = {
      mintedItemId: findToken._id,
      txnStatus: txReceipt.status,
      txnHash: onChainTxn.hash,
    };

    return res.json(responseData);
  } catch (err) {
    console.error(`Error (${routeName}): ${err}`);

    return next(err);
  }
});

router.get('/history/redemptions/:pubKey', async (req: Request, res: Response, next) => {
  const routeName = 'get/history/redemptions/:pubKey';

  try {
    let { pubKey } = req.params;
    pubKey = pubKey.toLowerCase();

    const qryPipeline = getDistinctContractsForOwner(pubKey);

    const dbReponse = await db
      .collection('tokenHistory')
      .aggregate(qryPipeline)
      .toArray();

    if (dbReponse.length == 0) return res.json([]);

    const promises = dbReponse.map(async (item: any) => {
      const distinctContracts = item.contracts.map(
        (contractItem: any) => contractItem.collectionInfo.contractAddress,
      );
      const alltokensForChain = await getTokensForOwner(
        pubKey,
        item._id,
        distinctContracts,
      );

      const formattedResponse = alltokensForChain.ownedNfts.map((tokenItem: OwnedNft) => {
        return {
          tokenId: tokenItem.tokenId,
          tokeName: tokenItem.title,
          collectionName: tokenItem?.contract?.name || '',
          contractAddress: tokenItem?.contract?.address || '',
          chainId: item._id,
          imageUrl: tokenItem.rawMetadata?.image?.replace('ipfs://', '') || '',
        };
      });

      return {
        chainId: item._id,
        totalOwned: alltokensForChain.totalCount,
        ownedTokens: formattedResponse,
      };
    });

    const finalResponse = await Promise.all(promises);

    return res.json(finalResponse);
  } catch (err: any) {
    console.error(`Error (${routeName}): ${err}`);
    return next(err);
  }
});

export default router;
