import {
  useState, 
  useContext, 
  useEffect, 
  createContext, 
  FunctionComponent,
  useMemo,
  useCallback
} from 'react';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
import { useLocation, matchPath, useNavigate } from 'react-router-dom';
//import {clearApplicationSession, setApplicationSession} from '../utils/auth'
import {findAccountByWallet} from '../utils/fetch';
import jwtDecode, { JwtPayload }  from 'jwt-decode';
import { isChainValid } from '../utils/helpers';


export const MetamaskContext = createContext({
  metamaskInstalled: false,
  walletAddress: '',
  isWalletRegistered: false,
  updateStorageInfo: (status: boolean) => {},
  connectToMetamask: async () => "",
  resetWalletInfo: () => {},
});

//=> Promise<string>
//Dispatch<SetStateAction<boolean>>


const getLocalStorage = (keyName :string) => {
  const storageItem = localStorage.getItem(keyName);
  if(storageItem){
    const item = JSON.parse(storageItem);
    return item;
  }
  return null;
}

const setLocalStorage = (data: any, keyName: string) => {
  const valueToStore = JSON.stringify(data);
  localStorage.setItem(keyName,valueToStore);
}


const MetamaskProvider : FunctionComponent<MetamaskProviderProps> = ({ children }) => {

  let provider: ethers.BrowserProvider;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
 //const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletRegistered, setIsWalletRegistered] = useState(false);
  

  // // const [activeChainValid, setActiveChainValid] = useState(false);
  // // const [walletAddress, setWalletAddress] = useState('');
  // // const [reviewingAccount, setReviewingAccount] = useState(false);

  // /** pre requisites **/

  //metamask must be installed


  // // network (chain) must be polygon
  // const reviewActiveChain = useCallback( async () => {
  //   const hexChainId = await provider.send('eth_chainId', []);
  //   const chainIdDecimal = parseInt(hexChainId, 16);
  //   //console.log("chainID", chainIdDecimal);
  //   if(chainIdDecimal == 80001  || chainIdDecimal == 137) {
  //     setActiveChainValid(true);
  //     window.ethereum.on("chainChanged", forceLogOut);
  //   }
  // },[]);
  
  // /** review metamask account **/

  // const reviewIfWalletIsRegistered = useCallback( async (pubAddress : string) => {
  //   // console.log("reviewIfWalletIsRegistered", pubAddress);
  //   // if(pubAddress !== ""){
  //   //   try{
  //   //     setReviewingAccount(true);
  //   //     const response = await findUserByKey(pubAddress.toLocaleLowerCase());
  //   //     const returnedAddress = response.data.address;
  //   //     const accessToken = response.data.token;
  //   //     if(returnedAddress !== pubAddress) throw new Error("Error on server.");
  //   //     //setApplicationSession(accessToken);
  //   //     setReviewingAccount(false);
  //   //     navigate('/dashboard');
  //   //   }catch(err){
  //   //     setReviewingAccount(false);
  //   //   }
  //   // }
  // },[]);

  // const reviewIfWalletIsConnected = useCallback( async ( validChain: boolean) => {
  //   console.log("reviewIfWalletIsConnected", validChain);
  //   if(validChain){
  //     try{
  //       const accounts = await provider.send('eth_accounts', []);
  //       console.log("accounts", accounts);
  //       if(accounts.length > 0){
  //         setWalletAddress(accounts[0]);
  //         window.ethereum.on("accountsChanged", forceLogOut);
  //       }
  //     }catch(err: any){
  //       console.error("Please connect metamask to the application.")
  //     }
  //   }
  // },[]);

  // /** events **/

  // const forceLogOut = async () => {
  //   setWalletAddress("");
  //   //clearApplicationSession();
  //   window.location.href = '/';
  // }

  // useEffect(() => {
  //   if( isMetamaskInstalled() ){
  //     reviewActiveChain();
  //     reviewIfWalletIsConnected(activeChainValid);
  //     if( matchPath("/", pathname)){
  //       reviewIfWalletIsRegistered(walletAddress);
  //     }
  //   }
  // },[activeChainValid, walletAddress]);
  
  // /** set context **/

  // const contextValue = useMemo(() => ({
  //   metamaskInstalled,
  //   walletAddress,
  // }),[metamaskInstalled, walletAddress]);

  const isMetamaskInstalled = useCallback( () => {
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
      //setProvider(getProvider);

      console.log("provider", provider);
      //const tt = await provider.send('eth_accounts', []);
      //console.log("test", tt);

      setMetamaskInstalled(true);
      return true;
    }
    return false;
  },[]);

  const getAccount = useCallback( async () => {

    const currentInfo = getLocalStorage("accountInfo");
    const accounts = await provider.send('eth_accounts', []);
    
    if(accounts.length > 0){
      if( currentInfo !== null){
        if( accounts[0] === currentInfo.wallet && currentInfo.isRegistered){
          console.log("aqui , set from localstorage");
          setWalletAddress(currentInfo.wallet);
          setIsWalletRegistered(currentInfo.isRegistered);
        }else{
          console.log("aqui , localstorage invalid");
          localStorage.clear();
        }
      }else{
        console.log("no localstorage", accounts[0])
        setWalletAddress(accounts[0]);
      }
    }
  },[]);
  

  const updateStorageInfo = async (status: boolean) => {
    
    setLocalStorage({
      wallet: walletAddress,
      isRegistered: status 
    }, "accountInfo");
    
    setIsWalletRegistered(status);
  }

  const connectToMetamask = async() => {
    try{
      
      console.log("provider", provider);

      if(!provider && metamaskInstalled)
        provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send('eth_requestAccounts', []);
      if(accounts.length > 0){
        console.log("accounts", accounts);
        setWalletAddress(accounts[0]);
        return accounts[0];
      }
    }catch(err: any){
      console.log("TEST", err.error);

      if(err.error.code == -32002){
        await provider.send('wallet_requestPermissions', [{ eth_accounts: {} }]);
      }
      //wallet_requestPermissions
      // console.log("Please connect metamask to application", err);
    }
    return "";
  }

  const resetWalletInfo = () => {
    setWalletAddress('');
    setIsWalletRegistered(false);
    localStorage.clear();
  }

  useEffect(() => {
    //const isInstalled = isMetamaskInstalled();
    if( isMetamaskInstalled() ){
      getAccount();
    }else{
      console.log("metamask is not installed")
    }
  },[]);

  const contextValue ={
    metamaskInstalled,
    walletAddress,
    isWalletRegistered,
    updateStorageInfo,
    connectToMetamask,
    resetWalletInfo
  }

  return (
    <MetamaskContext.Provider value={contextValue}>
      {children}
    </MetamaskContext.Provider>
  );
};

const useMetamaskContext = () => useContext(MetamaskContext);

const propTypes = {
  children: PropTypes.node.isRequired,
};
type MetamaskProviderProps = PropTypes.InferProps<typeof propTypes>;
MetamaskProvider.propTypes = propTypes

export { MetamaskProvider, useMetamaskContext };
