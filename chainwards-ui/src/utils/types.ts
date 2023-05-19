/** accounts **/

export type NewAccountResponse = {
  id: string;
  address: string;
  signingKey: {
    privateKey: string;
    publicKey: string;
  };
};

/** collections **/

export type NewCollectionFormValues = {
  name: string;
  description: string;
  symbol: string;
};

export type CollectionsRow = {
  _id: string;
  collectionId: string;
  collectioName: string;
  collectioSymbol: string;
  contractAddress: string;
  contractOwner: string;
  chainId: string;
  transactionHash: string;
  transactionStatus: string;
  createdOn: string;
};

export type NewCollectionReqBody = {
  deployAddress: string;
  txnHash: string;
  chainId: string;
  collectionInfo: {
    name: string;
    symbol: string;
    description: string;
  };
};

// to review -->
export type CollectionInfoType = {
  _id: string;
  collection_name: string;
  collection_description: string;
  contract_address: string;
  transaction_status: string;
  transaction_hash: string;
  created_on: string;
  deployed_by: string;
  chainId: number;
};

export type ReqBodyIssuers = {
  collection_id: string;
  new_list: string[];
};
