import express, { Request, Response } from 'express';
import db from '../db';
import config from 'config';
import multer from 'multer';
import { NFTStorage, File as NftFile } from 'nft.storage';
import * as types from '../utils/types';
import { validateAddress, getMerkleRoot, stringToAdressArray } from '../utils/dappUtils';
import { ObjectId } from 'mongodb';

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

      const storageServiceKey = config.get<string>('nft_storage_key');

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

export default router;
