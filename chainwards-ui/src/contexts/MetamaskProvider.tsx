import {
  useState,
  useContext,
  useEffect,
  createContext,
  FunctionComponent,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';

export const MetamaskContext = createContext({
  metamaskInstalled: false,
  walletAddress: '',
  isWalletRegistered: false,
  chainId: 0,
  updateStorageInfo: (status: boolean) => {},
  connectToMetamask: async () => '',
  resetWalletInfo: () => {},
  getRpcSigner: () => {},
});

const getLocalStorage = (keyName: string) => {
  const storageItem = localStorage.getItem(keyName);
  if (storageItem) {
    const item = JSON.parse(storageItem);
    return item;
  }
  return null;
};

const setLocalStorage = (data: any, keyName: string) => {
  const valueToStore = JSON.stringify(data);
  localStorage.setItem(keyName, valueToStore);
};

const MetamaskProvider: FunctionComponent<MetamaskProviderProps> = ({ children }) => {
  let provider: ethers.BrowserProvider;

  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletRegistered, setIsWalletRegistered] = useState(false);
  const [chainId, setChainId] = useState<number>(
    Number(localStorage.getItem('chainId')) || 0,
  );

  const setProvider = () => {
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
    }
  };

  const reviewActiveChain = useCallback(async () => {
    const hexChainId = await provider.send('eth_chainId', []);
    const chainIdDecimal = parseInt(hexChainId, 16);
    setChainId(chainIdDecimal);
    localStorage.setItem('chainId', chainIdDecimal.toString());
  }, []);

  const isMetamaskInstalled = useCallback(() => {
    if (window.ethereum) {
      setMetamaskInstalled(true);
      return true;
    }
    return false;
  }, []);

  const getAccount = useCallback(async () => {
    const currentInfo = getLocalStorage('accountInfo');
    const accounts = await provider.send('eth_accounts', []);

    if (accounts.length > 0) {
      if (currentInfo !== null) {
        if (accounts[0] === currentInfo.wallet && currentInfo.isRegistered) {
          console.log('aqui , set from localstorage');
          setWalletAddress(currentInfo.wallet);
          setIsWalletRegistered(currentInfo.isRegistered);
        } else {
          console.log('aqui , localstorage invalid');
          localStorage.clear();
        }
      } else {
        console.log('no localstorage', accounts[0]);
        setWalletAddress(accounts[0]);
      }
    }
  }, []);

  const updateStorageInfo = async (status: boolean) => {
    setLocalStorage(
      {
        wallet: walletAddress,
        isRegistered: status,
      },
      'accountInfo',
    );

    setIsWalletRegistered(status);
  };

  const connectToMetamask = async () => {
    try {
      setProvider();
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length > 0) {
        console.log('accounts', accounts);
        setWalletAddress(accounts[0]);
        return accounts[0];
      }
    } catch (err: any) {
      if (err.error.code == -32002) {
        await provider.send('wallet_requestPermissions', [{ eth_accounts: {} }]);
      }
    }
    return '';
  };

  const resetWalletInfo = () => {
    setWalletAddress('');
    setIsWalletRegistered(false);
    localStorage.clear();
  };

  const getRpcSigner = async () => {
    setProvider();
    if (provider) {
      const rpcSigner = await provider.getSigner();
      return rpcSigner;
    }
    return null;
  };

  useEffect(() => {
    if (isMetamaskInstalled()) {
      setProvider();
      getAccount();
      reviewActiveChain();
    }
  }, []);

  const contextValue = {
    metamaskInstalled,
    walletAddress,
    isWalletRegistered,
    chainId,
    updateStorageInfo,
    connectToMetamask,
    resetWalletInfo,
    getRpcSigner,
  };

  return (
    <MetamaskContext.Provider value={contextValue}>{children}</MetamaskContext.Provider>
  );
};

const useMetamaskContext = () => useContext(MetamaskContext);

const propTypes = {
  children: PropTypes.node.isRequired,
};
type MetamaskProviderProps = PropTypes.InferProps<typeof propTypes>;
MetamaskProvider.propTypes = propTypes;

export { MetamaskProvider, useMetamaskContext };
