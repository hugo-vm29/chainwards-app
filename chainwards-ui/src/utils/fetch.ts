import axios from 'axios';
import Cookies from 'js-cookie';
import * as types from './types';

const cookiePrefix = '';
const apiUrl = 'http://localhost:8080';

export const getRequestOptions = () => {
  const accessToken = Cookies.get(`${cookiePrefix}access_token`);

  return {
    headers: {
      Authorization: accessToken,
    },
  };
};

/** Acccounts **/

export const findAccountByWallet = (address: string) => {
  const url = `${apiUrl}/accounts/findByWallet/${address}`;
  const result = axios.get(url);
  return result;
};

export const createNewAccount = (body: types.NewAccountReqBody) => {
  const url = `${apiUrl}/accounts`;
  const result = axios.post(url, body);
  return result;
};

/** Collections (contracts) * */

export const getCollectionsForAccount = (address: string) => {
  const url = `${apiUrl}/collections/findByWallet/${address}`;
  const result = axios.get(url);
  return result;
};

export const saveNewCollection = (data: types.NewCollectionReqBody) => {
  const url = `${apiUrl}/collections`;
  const result = axios.post(url, data);
  return result;
};

export const checkPendingTxnForCollection = (transactionId: string) => {
  const url = `${apiUrl}/collections/transaction/status/${transactionId}`;
  const result = axios.get(url);
  return result;
};

/** Collection detail **/

export const getSingleCollectionInfo = (collectionId: string) => {
  const url = `${apiUrl}/collections/${collectionId}`;
  const result = axios.get(url);
  return result;
};

export const getIssuersList = (collectionId: string) => {
  const url = `${apiUrl}/collections/issuers/${collectionId}`;
  const result = axios.get(url);
  return result;
};

export const updateCollectionIssuers = (data: types.PatchIssuersReqBody) => {
  const url = `${apiUrl}/collections/issuers`;
  const result = axios.patch(url, data);
  return result;
};

/** Tokens **/

export const saveTokenMetadata = (data: FormData) => {
  const url = `${apiUrl}/tokens/metadata/upload`;
  const result = axios.post(url, data);
  return result;
};

export const newListedToken = (data: types.NewTokenReqBody) => {
  const url = `${apiUrl}/tokens`;
  const result = axios.post(url, data);
  return result;
};

export const getTokenInCollection = (collectionId: string, tokenId: number) => {
  const url = `${apiUrl}/collections/${collectionId}/tokens/${tokenId}`;
  const result = axios.get(url);
  return result;
};

export const updateTokenClaimers = (data: types.PatchClaimersReqBody) => {
  const url = `${apiUrl}/tokens/claimers`;
  const result = axios.patch(url, data);
  return result;
};

export const getTokensToClaim = (pubKey: string) => {
  const url = `${apiUrl}/tokens/toClaim/${pubKey}`;
  const result = axios.get(url);
  return result;
};

export const mintToken = (data: types.MintTokenReqBody) => {
  const url = `${apiUrl}/tokens/mint`;
  const result = axios.post(url, data);
  return result;
};

export const getTokensOwnedTokens = (pubKey: string) => {
  const url = `${apiUrl}/tokens/history/redemptions/${pubKey}`;
  const result = axios.get(url);
  return result;
};

/** Merkle trees **/

export const newMerkleRoot = (data: string) => {
  const reqBody = {
    addressList: data,
  };

  const url = `${apiUrl}/merkle/root`;
  const result = axios.post(url, reqBody);
  return result;
};
