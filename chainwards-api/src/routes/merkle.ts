import express, { Request, Response } from 'express';
import { getMerkleRoot, stringToAdressArray } from '../utils/dappUtils';

/* eslint-disable camelcase */
const router = express.Router({ mergeParams: true });

router.post('/root', async (req: Request, res: Response, next) => {
  const routeName = { logSource: 'post/merkle/root' };

  try {
    const { addressList } = req.body;

    /** Compute merkle root hash with for a list of addresses (whitelisting functionality) **/

    const whitelist = stringToAdressArray(addressList);
    const merkleRoot = getMerkleRoot(whitelist);

    return res.json({
      merkleRoot: merkleRoot,
    });
  } catch (err: any) {
    console.error(`Error (${routeName}): ${err}`);
    return next(err);
  }
});

export default router;
