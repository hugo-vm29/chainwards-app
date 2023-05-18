import express, { Request, Response } from 'express';
import db from '../db';
import {setProvider , getRpcEndpoint, getTransactionReceipt} from '../utils/dappUtils';
import { ObjectId } from 'mongodb';

/* eslint-disable camelcase */
const router = express.Router({ mergeParams: true });


router.post( '/', async (req: Request, res: Response, next) => {
 
  try {
   
    const {  } = req.body;


    //send transaction to blockchain

    const txnObject = {
      from: "", //owner address,
      to: "", //contract address
      transactionHash: "",
      chainId: "",
      status: "pending",
      transactionType: "DEPLOY",
      timestamp: "",
      error: "",
    }

    const txnResponse = await db.collection('transaction').insertOne(txnObject);

    const collectionObject = {
      name: "", //owner address,
      symbol: "", //contract address
      description: "",
      transactionId: txnResponse.insertedId,
      status: "deploying", //active
      blockIssuers: false,
      createdOn: "",
      issuers: "",
    }

    const collectionResponse = await db.collection('collection').insertOne(collectionObject);

    //wait 
   

    //const response = await db.collection('contracts').insertOne(newContract);
    // return res.status(200).json({
    //   id: response.insertedId,
    //   transaction_hash: transaction_hash,
    //   contract_status: 'pending',
    // });

  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});


/*
router.get('/findAllByKey/:pubKey',  async (req: Request, res: Response, next) => {

  try {
   
    const { pubKey } = req.params;

    if(!pubKey)
      return res.status(400).send({ error: "A public key is required" });

    const dbReponse = await db
      .collection('collection')
      .aggregate([
        {
          $unwind: '$members',
        },
        {
          $lookup: {
            from: ROLES_COLLECTION,
            localField: 'members.org_role',
            foreignField: '_id',
            as: 'members.org_role',
          },
        },
        {
          $unwind: {
            path: '$members.org_role',
          },
        },
        {
          $replaceRoot: { newRoot: '$members' },
        },
        {
          $group: {
            _id: '$org_role._id',
            role_name: { $first: '$org_role.name' },
            users: { $push: '$user_id' },
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            role_name: roleName,
          },
        },
      ])
      .toArray();
    

    const allContracts = await db
      .collection('contracts')
      .find({ 'deployed_by': pubKey })
      //.project({ _id: 1, name: 1, client_status: 1, wallet: 1 })
      .toArray();

    return res.json(allContracts);

  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});


router.get('/:collectionId',  async (req: Request, res: Response, next) => {

  try {
   
    const { collectionId } = req.params;

    if(!collectionId)
      return res.status(400).send({ error: "Missing required query parameters" });

    const collectonData = await db
      .collection('contracts')
      .findOne({ '_id': new ObjectId(collectionId) })

    return res.json(collectonData);

  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});


router.get( '/check-deployment/:hash', async (req: Request, res: Response, next) => {
 
  try {
   
    const { hash } = req.params;

    const collectionObj = await db
    .collection('contracts')
    .findOne({ 'transaction_hash': hash });

    if(!collectionObj)
      return res.status(404).send({ error: "No collection was found with this transaction hash" });

    let txStatus = 'pending';

    if(collectionObj.status === "pending"){

      const rpcUrl = getRpcEndpoint(collectionObj.chainId);
      setProvider(rpcUrl);

      const txReceipt: any = await getTransactionReceipt(collectionObj.transaction_hash);

      if(txReceipt){
        if(txReceipt.status === 1){
          txStatus = "ready"
        }else{
          txStatus = "failed"
        }
      }

    //   const txReceipt:any = await getTransactionReceipt(collectionObj.transaction_hash, collectionObj.chainId);
      
    //   

    //   let txStatus = 'pending';

    //   if(txReceipt && txReceipt.status === 1){
    //     txStatus = "successful"

    //     await db.collection('contracts').updateOne(
    //       {
    //         'transaction_hash': hash
    //       }, 
    //       {
    //         $set: { status: txStatus }
    //       }
    //     );

    //   }else if(txReceipt && txReceipt.status !== 1){
    //     txStatus = "failed"
    //   }

    //   return res.json({
    //     id: collectionObj._id,
    //     name: collectionObj.name,
    //     transaction_hash: collectionObj.transaction_hash,
    //     status: txStatus,
    //   });
    }

    return res.status(200).json({
      id: collectionObj._id,
      name: collectionObj.collection_name,
      transaction_hash: collectionObj.transaction_hash,
      status: txStatus,
    });


  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});

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