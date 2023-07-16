import { Network, Alchemy } from 'alchemy-sdk';

const getAlchemySettings = (chainId: number) => {
  let settings;

  if (chainId == 5) {
    settings = {
      apiKey: process.env.GOERLI_API_KEY || '',
      network: Network.ETH_GOERLI,
    };
  } else if (chainId == 80001) {
    settings = {
      apiKey: process.env.MUMBAI_API_KEY || '',
      network: Network.MATIC_MUMBAI,
    };
  }
  return settings;
};

export const getTokensForOwner = async (
  walletAddress: string,
  chainId: number,
  distinctContracts: string[],
) => {
  const settings = getAlchemySettings(chainId);

  if (settings?.apiKey === '') throw new Error('Missing keys for node provider');

  const alchemy = new Alchemy(settings);

  const nftsForOwner = await alchemy.nft.getNftsForOwner(walletAddress, {
    contractAddresses: distinctContracts,
  });

  return nftsForOwner;
};
