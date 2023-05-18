
export type NewAccountResponse = {
  id: string,
  address: string,
  signingKey: {
    privateKey: string,
    publicKey: string
  }
}

export type CollectionsTableRowType = {
  _id: string,
  collection_name: string,
  contract_address: string,
  transaction_status: string,
  transaction_hash: string,
  created_on: string,
}

export type CollectionInfoType = {
  _id: string,
  collection_name: string,
  collection_description: string,
  contract_address: string,
  transaction_status: string,
  transaction_hash: string,
  created_on: string,
  deployed_by: string,
  chainId: number,
}

export type ReqBodyCollections = {
  collection_name: string,
  collection_description: string,
  contract_address: string,
  transaction_hash: string,
  chainId: number,
  deployed_by: string
}

export type ReqBodyIssuers = {
  collection_id: string,
  new_list: string []
}