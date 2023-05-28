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
  collectionName: string;
  collectionSymbol: string;
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

export type CollectionDetail = {
  _id: string;
  collectionName: string;
  collectiondescription: string;
  collectionSymbol: string;
  contractAddress: string;
  contractOwner: string;
  chainId: number;
  collectionStatus: string;
  blockIssuers: boolean;
  transactionHash: string;
  createdOn: Date;
};

export type ListedToken = {
  tokenId: number;
  issuer: string;
  merkletRoot: string;
  claimable: boolean;
  claimers: string[];
};

export type TokenGalleryItem = {
  tokenId: number;
  name: string;
  owners: string[];
  image: string;
  claimable: boolean;
};

export type NewTokenReqBody = {
  tokenId: number;
  issuer: string;
  contract: string;
  txnHash: string;
  chainId: number;
  claimers: string;
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
