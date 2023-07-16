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
    apiKey = process.env.GOERLI_API_KEY || '';
  } else if (chainId == 80001) {
    apiKey = process.env.MUMBAI_API_KEY || '';
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

/*** contract interaction ***/

const getWallet = (privateKey: string) => {
  if (!privateKey) throw new ReferenceError('No privateKey provided for getWallet');
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
};

export const getContractWithWallet = async (
  contractJson: any,
  contractAddr: string,
  walletAddr: string,
) => {
  const walletAccount = await getWallet(walletAddr);
  const contractInstance = new ethers.Contract(
    contractAddr,
    contractJson.abi,
    walletAccount,
  );

  //const contract = new ethers.Contract(address, contractJson.abi, provider);
  //const contractWithSigner = contract.connect(signer);

  return contractInstance;
};

/*** address validation ***/

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

/*** merkle trees ***/

export const getMerkleRoot = (whitelist: string[]) => {
  const leaves = whitelist.map((addr) => ethers.keccak256(addr));
  const merkleTree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
  const merkleRootHash = merkleTree.getHexRoot();
  return merkleRootHash;
};

export const getMerkleProof = (toAddress: string, whitelist: string[]) => {
  const leaves = whitelist.map((addr) => ethers.keccak256(addr));
  const merkleTree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
  const hashedAddress = ethers.keccak256(toAddress);
  const proof = merkleTree.getHexProof(hashedAddress);
  return proof;
};
