import config from 'config';
import { ethers } from 'ethers';
import { MerkleTree } from 'merkletreejs';
import { RPC_ENDPOINTS } from './constants';

let provider: ethers.JsonRpcProvider | null = null;

export const createWallet = () => {
  const newWallet = ethers.Wallet.createRandom();

  const walletData = {
    address: newWallet.address.toLocaleLowerCase(),
    signingKey: {
      publicKey: newWallet.publicKey,
      privateKey: newWallet.privateKey,
    },
  };

  return walletData;
};

const getNetworkUrl = (chainId: number) => {
  let networkUrl = '';

  if (chainId == 5) {
    networkUrl = RPC_ENDPOINTS.goerli;
  } else if (chainId == 80001) {
    networkUrl = RPC_ENDPOINTS.mumbai;
  }
  return networkUrl;
};

const getNetworkApiKey = (chainId: number) => {
  let apiKey = '';

  if (chainId == 5) {
    apiKey = config.get<string>('goerli_api_key');
  } else if (chainId == 80001) {
    apiKey = config.get<string>('mumbai_api_key');
  }
  return apiKey;
};

const getProvider = () => {
  if (provider != null) return provider;
  throw new ReferenceError('Provider not defined');
};

export const setProvider = (uri: string) => {
  if (!uri || uri === '') throw new Error('No uri specified');
  provider = new ethers.JsonRpcProvider(uri);
  return provider;
};

export const getRpcEndpoint = (chainId: number) => {
  const networkUrl = getNetworkUrl(chainId);
  const apiKey = getNetworkApiKey(chainId);

  if (networkUrl === '' || apiKey === '') throw new Error('RPC url not found');

  return `${networkUrl}/${apiKey}`;
};

export const getTransactionReceipt = async (txHash: string) => {
  const provider = getProvider();
  const txReceipt = await provider.getTransactionReceipt(txHash);
  return txReceipt;
};

export const getMerkleRoot = (whitelist: string[]) => {
  const leaves = whitelist.map((addr) => ethers.keccak256(addr));
  const merkleTree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
  const merkleRootHash = merkleTree.getHexRoot();
  return merkleRootHash;
};

export const validateAddress = (address: string) => {
  return ethers.isAddress(address);
};

export const stringToAdressArray = (data: string) => {
  const addresses = data.trim().split(',');
  const whitelist: string[] = [];

  addresses.forEach((item: string) => {
    if (item !== '' && validateAddress(item)) {
      whitelist.push(item.toLocaleLowerCase());
    }
  });

  return whitelist;
};

export const validateAdressArray = (addressArray: string[]) => {
  const filteredArray = addressArray.filter(
    (item) => item !== '' && ethers.isAddress(item),
  );
  return filteredArray;
};

// const getAlchemyConfig = (chainId: number) => {

//   let network = Network.ETH_GOERLI;
//   let apiKey =  config.get<string>("goerli_api_key");

//   if(chainId == 80001){
//     network = Network.MATIC_MUMBAI;
//     apiKey = config.get("mumbai_api_key");
//   }

//   const alchemySettings = {
//     apiKey: apiKey,
//     network: network
//   }

//   return alchemySettings;
// }

// export const getTransactionReceipt = async(txHash: string, chainId: number) => {

//   try{
//     const settings = getAlchemyConfig(chainId);
//     const alchemy = new Alchemy(settings);
//     const txReceipt = await alchemy.core.getTransactionReceipt(txHash);
//     return txReceipt;
//   }catch(err){
//     return err;
//   }
// }
