import express, { Request, Response } from 'express';
import db from '../db';
import config from 'config';
import multer from 'multer';
import { NFTStorage, File as NftFile } from 'nft.storage';
import * as types from '../utils/types';
import { validateAddress, getMerkleRoot } from '../utils/dappUtils';

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

      // const tokenURISample = "bafyreic5th7uhzxeukjf6k4e5zzq4cvfjrt6c4kbj2ehi577kpy2mwsrya/metadata.json";
      // const rootSample = "0x37181768d1bbc7e81f1c388228b2f8012b613ced2a4d988a5522069587f2a0a7";

      // return res.json({
      //   tokenURI: tokenURISample,
      //   merkleRoot: rootSample
      // });

      /** Compute merkle root hash with claimers (whitelisting functionality) **/

      const addresses = claimers.trim().split(',');
      const whitelist: string[] = [];

      addresses.forEach((item: string) => {
        if (item !== '' && validateAddress(item)) {
          whitelist.push(item.toLocaleLowerCase());
        }
      });

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

      //const client = new NFTStorage({ endpoint: endpoint, token: NFT_STORAGE_TOKEN })
      // console.log("test 1", (typeof req));
      // console.log("test 2", (typeof req.file));
      //console.log("req file", req.file);
      //console.log("token name", name);
      //const fileExtension = extname(req.file.originalname);
      // const metadata = await client.store(nftMetadata);

      // console.log('FULL metadata: -->\n', metadata);

      // console.log('IPFS URL for the metadata --> ', metadata.url)
      // console.log('metadata.json contents --> \n', metadata.data)
      // console.log('metadata.json with IPFS gateway URLs--> \n', metadata.embed());

      // https://nftstorage.link/ipfs/bafyreibxarf4m665m4563alat4ydyq5nirx76yquw6vtxvnxmlpoxllegm/metadata.json
    } catch (err) {
      console.error(`Error: ${err}`);
      return next(err);
    }
  },
);

router.post('/', async (req: Request, res: Response, next) => {
  const logMetaData = { logSource: 'post/routes/tokens' };

  try {
    const { tokenId, issuer, contract, txnHash, chainId, claimers } = req.body;

    const txnObject = {
      from: issuer.toLowerCase(),
      to: contract,
      transactionHash: txnHash,
      chainId: Number(chainId),
      status: 'completed',
      transactionType: 'ISSUE',
      contractAddress: contract,
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
      whitelist: whitelist,
      claimable: true,
      timestamp: new Date(),
    };

    await db.collection('tokens').insertOne(tokenObject);

    return res.json({
      tokenId: tokenId,
      transactionId: txnResponse.insertedId,
    });
  } catch (err) {
    console.error(`Error (${logMetaData}): ${err}`);
    return next(err);
  }
});

export default router;
