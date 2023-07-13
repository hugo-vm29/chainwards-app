/** accounts **/

export type FindAccountResponse = {
  _id: string;
  displayName: string;
  wallet: {
    address: string;
  };
};

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
  owners: string[];
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

/** Claiming tokens **/

export type ClaimableTokensResponse = {
  _id: string;
  tokenId: number;
  whitelist: string[];
  chainId: number;
  collectionInfo: {
    _id: string;
    name: string;
    contractAddress: string;
  };
};

export type TokenToClaim = {
  claimRequestId: string;
  tokenId: number;
  tokenName: string;
  image: string;
  collectionName: string;
  collectionId: string;
  chainId: number;
};

export type MintTokenReqBody = {
  tokenId: number;
  collectionId: string;
  addressTo: string;
};

/** Profile **/

export type RedeemedTokenItem = {
  tokenId: number;
  tokeName: string;
  collectionName: string;
  contractAddress: string;
  chainId: number;
  imageUrl: string;
};
