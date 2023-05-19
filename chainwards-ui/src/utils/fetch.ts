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

export const createNewAccount = (username: string) => {
  const body = {
    username,
  };

  const url = `${apiUrl}/accounts`;
  const result = axios.post(url, body);
  return result;
};

/** Collections (contracts) * */

export const getCollectionsForAccount = (address: string, chainId: number) => {
  //collections/find/0xb8790386c88565e681b708bc227b76cd0733c603?chainId=80001
  const url = `${apiUrl}/collections/findByWallet/${address}?chainId=${chainId}`;
  const result = axios.get(url);
  return result;
};

export const saveNewCollection = (data: types.NewCollectionReqBody) => {
  const url = `${apiUrl}/collections`;
  const result = axios.post(url, data);
  return result;
};

export const checkPendingTxnForCollection = (txId: string) => {
  const url = `${apiUrl}/collections/transaction/status/${txId}`;
  const result = axios.get(url);
  return result;
};

/** Collection detail * */

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

export const changeCollectionIssuers = (data: types.ReqBodyIssuers) => {
  const url = `${apiUrl}/collections/issuers`;
  const result = axios.put(url, data);
  return result;
};
