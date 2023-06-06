import express, { Request, Response } from 'express';
import db from '../db';
import { createWallet } from '../utils/dappUtils';

/* eslint-disable camelcase */
const router = express.Router({ mergeParams: true });

router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { publicAddr, username } = req.body;

    const findAccount = await db.collection('accounts').findOne(
      { 'wallet.address': publicAddr },
      {
        projection: {
          _id: 1,
          'wallet.address': 1,
        },
      },
    );

    if (findAccount) return res.status(400).send({ error: 'Duplicated account' });

    const wallet = createWallet();

    const newUser = {
      displayName: username,
      name: '',
      lastName: '',
      wallet: {
        ...wallet,
      },
    };

    const dbResponse = await db.collection('accounts').insertOne(newUser);

    console.log('newUser', newUser);

    return res.json({
      id: dbResponse.insertedId,
      displayName: username,
      ...wallet,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});

router.get('/findByWallet/:walletAddr', async (req: Request, res: Response, next) => {
  try {
    const { walletAddr } = req.params;

    const accountsData = await db.collection('accounts').findOne(
      { 'wallet.address': walletAddr.toLowerCase() },
      {
        projection: {
          _id: 1,
          displayName: 1,
          'wallet.address': 1,
        },
      },
    );

    if (!accountsData) return res.status(404).send({ error: 'No account found' });

    return res.json(accountsData);
  } catch (err) {
    console.error(`Error: ${err}`);
    return next(err);
  }
});

export default router;
