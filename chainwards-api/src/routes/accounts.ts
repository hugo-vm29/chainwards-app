import express, { Request, Response } from 'express';
import db from '../db';
import {setProvider , getRpcEndpoint, getTransactionReceipt} from '../utils/dappUtils';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import {createWallet} from '../utils/dappUtils'

/* eslint-disable camelcase */
const router = express.Router({ mergeParams: true });


router.post( '/', async (req: Request, res: Response, next) => {
 
  try {
   
    const { username } = req.body;
    //const hashedPass = await bcrypt.hash( password, 10);
    
    return res.json({
      id: "'646441aacb06612ac957d02f",
      address: "0xb8790386c88565e681b708bc227B76Cd0733c603",
      signingKey: {
        privateKey: "0xea90d99fae1db2935aca86a2b0f7b9efaa76b4c278f5ce2fd56dc8edcc35e178",
        publicKey: "0x0250a25665c4489ae3fe464d3d08f3c69625e12560ea0b86aae521603e44621101"
      }
    });

    const wallet = createWallet();

    const newUser = {
      displayName: username,
      name: "", 
      lastName: "",
      wallet: {
        ...wallet
      }
    }
    
    const dbResponse  = await db.collection('accounts').insertOne(newUser);
    
    console.log("newUser", newUser);
    return res.json({
      id: dbResponse.insertedId,
      ...wallet
    });

  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }

});

router.get('/findByWallet/:walletAddr', async (req: Request, res: Response, next) => {
 
  try {
   
    const { walletAddr } = req.params;
    
    const collectonData = await db
      .collection('accounts')
      .findOne(
        { 'wallet.address' : walletAddr },
        {
          projection: {
            _id: 1,
            name: 1,
            'wallet.address': 1
          },
        }
      );

    
    if(!collectonData)
      return res.status(404).send({ error: "No account found" });

    return res.json(collectonData);

  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }

});

export default router;