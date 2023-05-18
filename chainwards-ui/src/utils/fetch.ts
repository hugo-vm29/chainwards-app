import axios from 'axios';
import Cookies from 'js-cookie';
import * as CustomTypes from './types';

const cookiePrefix = "";
const apiUrl = "http://localhost:8080";

export const getRequestOptions = () => {
 
  const accessToken = Cookies.get(`${cookiePrefix}access_token`);

  return {
    headers: {
      Authorization: accessToken
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
    username
  };

  const url = `${apiUrl}/accounts`;
  const result = axios.post(url, body);
  return result;
};



/** Collections (contracts) * */

export const getCollectionsByAddress = (address: string) => {
  const url = `${apiUrl}/collections/findAllByKey/${address}`;
  const result = axios.get(url);
  return result;
};

export const saveNewCollection = (data: CustomTypes.ReqBodyCollections) => {
  const url = `${apiUrl}/collections`;
  const result = axios.post(url, data);
  return result;
};


export const checkPendingDeployment = (txHash: string) => {
  const url = `${apiUrl}/collections/check-deployment/${txHash}`;
  const result = axios.get(url);
  return result;
};


/** Collection detail * */

export const getSingleCollectionInfo = ( collectionId: string) => {
  const url = `${apiUrl}/collections/${collectionId}`;
  const result = axios.get(url);
  return result;
};


export const getIssuersList = ( collectionId: string) => {
  const url = `${apiUrl}/collections/issuers/${collectionId}`;
  const result = axios.get(url);
  return result;
};

export const changeCollectionIssuers = (data: CustomTypes.ReqBodyIssuers) => {
  const url = `${apiUrl}/collections/issuers`;
  const result = axios.put(url, data);
  return result;
};
