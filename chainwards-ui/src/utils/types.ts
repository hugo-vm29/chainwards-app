/** accounts **/

export type NewAccountReqBody = {
  publicAddr: string;
  username: string;
};

export type NewAccountResponse = {
  id: string;
  displayName: string;
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
  name: string;
  description: string;
  symbol: string;
  contractAddress: string;
  owner: string;
  status: string;
  blockIssuers: boolean;
  createdOn: Date;
  chainId: number;
  transactionInfo: {
    _id: string;
    transactionHash: string;
    status: string;
  };
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

export type PatchIssuersReqBody = {
  collectionId: string;
  newIssuers: string[];
  from: string;
  txnHash: string;
};

/** tokens **/

export type ListedToken = {
  tokenId: number;
  issuer: string;
  merkletRoot: string;
  claimable: boolean;
  claimers: string[];
};

export type TokenGalleryItem = {
  tokenId: number;
  issuer: string;
  claimable: boolean;
  owners: string[];
  name: string;
  image: string;
  whitelist: string[];
  chainId: number;
  lastUpdated: string | Date;
};

export type NewTokenReqBody = {
  tokenId: number;
  issuer: string;
  contract: string;
  txnHash: string;
  chainId: number;
  claimers: string;
};

export type PatchClaimersReqBody = {
  tokenId: number;
  collectionId: string;
  newClaimers: string;
  from: string;
  txnHash: string;
};
