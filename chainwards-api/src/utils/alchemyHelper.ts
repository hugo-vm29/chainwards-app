import { Network, Alchemy } from 'alchemy-sdk';
import config from 'config';

const getAlchemySettings = (chainId: number) => {
  let settings;

  if (chainId == 5) {
    settings = {
      apiKey: config.get<string>('goerli_api_key'),
      network: Network.ETH_GOERLI,
    };
  } else if (chainId == 80001) {
    settings = {
      apiKey: config.get<string>('mumbai_api_key'),
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
  const alchemy = new Alchemy(settings);

  const nftsForOwner = await alchemy.nft.getNftsForOwner(walletAddress, {
    contractAddresses: distinctContracts,
  });

  return nftsForOwner;
};
