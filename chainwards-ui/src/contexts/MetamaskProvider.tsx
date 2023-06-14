import { useState, useContext, useEffect, createContext, useCallback } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

/* eslint-disable @typescript-eslint/no-empty-function */

type MetamaskContextType = {
  isMetamaskInstalled: boolean;
  userWallet: string;
  chainId: number;
  connectMetaMask: () => Promise<string>;
  getRpcSigner: () => void;
};

const defaultState = {
  isMetamaskInstalled: false,
  userWallet: '',
  chainId: -1,
  connectMetaMask: async () => '',
  getRpcSigner: () => {},
};

export const MetamaskContext = createContext<MetamaskContextType>(defaultState);

const MetamaskProvider = ({ children }: MetamaskProviderProps) => {
  const [userWallet, setUserWallet] = useState('');
  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);
  const [chainId, setChainId] = useState<number>(0);

  let provider: ethers.BrowserProvider;

  const setProvider = () => {
    provider = new ethers.BrowserProvider(window.ethereum);
  };

  const connectMetaMask = async () => {
    try {
      setProvider();
      await provider.send('eth_requestAccounts', []);
      // if(accounts.length > 0){
      //   const newAccount = await provider.getSigner();
      //   setUserWallet(newAccount.address);
      //   return newAccount.address;
      // }
    } catch (err: any) {
      console.log('ERROR', err);
      if (err?.error?.code == -32002) {
        await provider.send('wallet_requestPermissions', [{ eth_accounts: {} }]);
      }
    }
    return '';
  };

  const reviewActiveChain = useCallback(async () => {
    const hexChainId = await provider.send('eth_chainId', []);
    const chainIdDecimal = parseInt(hexChainId, 16);
    setChainId(chainIdDecimal);
  }, []);

  const updateWallet = useCallback(async () => {
    try {
      const accounts = await provider.send('eth_accounts', []);
      console.log('updateWallet', accounts);
      if (accounts.length > 0) {
        localStorage.clear();
        const newAccount = await provider.getSigner();
        setUserWallet(newAccount.address);
      }
    } catch (err: any) {
      console.log('Unable to get wallet from metamask: ', err?.message || '');
    }
  }, []);

  const getRpcSigner = async () => {
    setProvider();
    if (provider) {
      const rpcSigner = await provider.getSigner();
      return rpcSigner;
    }
    return null;
  };

  const metamaskChangesListener = () => {
    setUserWallet('');
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    const reviewMetamask = async () => {
      const ethProvider = await detectEthereumProvider({
        silent: true,
        mustBeMetaMask: true,
      });
      setIsMetamaskInstalled(Boolean(ethProvider));

      if (ethProvider) {
        setProvider();
        updateWallet();
        reviewActiveChain();
        window.ethereum.on('accountsChanged', metamaskChangesListener);
        window.ethereum.on('chainChanged', metamaskChangesListener);
      }
    };

    reviewMetamask();

    return () => {
      window.ethereum?.removeListener('accountsChanged', metamaskChangesListener);
      window.ethereum?.removeListener('chainChanged', metamaskChangesListener);
    };
  }, []);

  const contextValue = {
    userWallet,
    isMetamaskInstalled,
    chainId,
    connectMetaMask,
    getRpcSigner,
  };

  return (
    <MetamaskContext.Provider value={contextValue}>{children}</MetamaskContext.Provider>
  );
};

const useMetamaskContext = () => useContext(MetamaskContext);

type MetamaskProviderProps = {
  children: string | JSX.Element | JSX.Element[];
};

export { MetamaskProvider, useMetamaskContext };
