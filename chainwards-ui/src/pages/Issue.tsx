import { useState, useEffect , useCallback} from 'react';
import { BaseContract, Contract, ethers } from 'ethers';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { getCollectionsByAddress } from '../utils/fetch';
// import CollectionsTable  from '../components/collections/CollectionsTable';
import NewCollection , {FormValues}  from '../components/collections/NewCollection';
import RewardsContract from '../contracts/Rewards.json';
import {ReqBodyCollections, CollectionsTableRowType} from '../utils/types';
import {saveNewCollection, checkPendingDeployment} from '../utils/fetch';


const provider = new ethers.BrowserProvider(window.ethereum);


const Issue = () => {
  
  const [loading, setLoading] = useState(true);
  const [collectionsList, setCollectionsList] = useState<CollectionsTableRowType[]>([]);

  const [walletAddress, setWalletAddress] = useState('');
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState(0);

  const [openModalNew, setOpenModalNew] = useState(false);
  const [submittingData, setSubmittingData] = useState(false);

  const reviewActiveChain = useCallback( async () => {
    const hexChainId = await provider.send('eth_chainId', []);
    const chainIdDecimal = parseInt(hexChainId, 16);
    setChainId(chainIdDecimal);
  },[]);

  const getAccounts = useCallback( async () => {
    if (window.ethereum) {
      const accounts = await provider.send('eth_requestAccounts', []);
      setWalletAddress(accounts[0]);
      const rpcSigner = await provider.getSigner();
      setSigner(rpcSigner);
    }
    return false;
  },[]);

  const getCollections = useCallback( async () => {
    if (walletAddress !== '') {
      const response = await getCollectionsByAddress(walletAddress);
      if(response.status == 200){
        setCollectionsList(response.data);
      }
    }
    return false;
  },[walletAddress]);

  useEffect(() => {
    if(window.ethereum){
      // setLoading(true);
      // getAccounts();
      // getCollections();
      // reviewActiveChain();
      // setLoading(false);
    }
  }, [walletAddress]);

  const onClickNewCollection = () => {
    setOpenModalNew(true);

  };

  const onClickCancelNew = () => {
    setOpenModalNew(false);
  }

  const onSubmitNewCollection = async( formValues: FormValues ) => {
    
    try{

      setSubmittingData(true);
      //console.log("submit contract", formValues);
      //console.log("signer : ", signer);
    
      const factory = new ethers.ContractFactory(
        RewardsContract.abi,
        RewardsContract.bytecode,
        signer
      );

      const baseMetadataURI = "https://ipfs.filebase.io/ipfs/";
      const contractInstance = await factory.deploy(formValues.input_name,baseMetadataURI);
      
      //console.log("contractInstance : ", contractInstance);

      const ctAddress = await contractInstance.getAddress();
      const deployTransaction = contractInstance.deploymentTransaction();

      //console.log("ctAddress : ", ctAddress);
      //console.log("deploymentTransaction : ", deployTransaction);

      const body: ReqBodyCollections = {
        collection_name: formValues.input_name,
        collection_description: formValues.input_description,
        contract_address: ctAddress,
        transaction_hash: deployTransaction?.hash || "",
        chainId: chainId,
        deployed_by: walletAddress
      }

      const apiResponse = await saveNewCollection(body);

      //console.log("api response : ", apiResponse.data);

      setOpenModalNew(false);
      setSubmittingData(false);
      await refreshMainTable();

    }catch(err){
      console.log("ERROR", err);
    }
  }

  const refreshMainTable = async () => {
    setLoading(true);
    await getCollections();
    setLoading(false);
  }

  const checkPendingCollection = async(txHash: string) => {
    
    setLoading(true);
    const response = await checkPendingDeployment(txHash);

    if( response.status == 200){
      if( response.data.status == "ready"){
        let newData : CollectionsTableRowType[] = [...collectionsList];
        const findRow : CollectionsTableRowType | undefined = newData.find( x => x.transaction_hash == txHash);
        if(findRow){
          findRow.transaction_status = response.data.status;
          setCollectionsList(newData);
        }
      }
    }

    setLoading(false);
  }

  return (
    <Box component="div" sx={{py: 2, px: 4}}>
      <Typography variant="h4"> Issue A Collection</Typography>
      <Typography sx={{my: 2}}> 
        From this page you can create a new NFT collection for your reward program which will be represented by a smart contract. You can also view a list of all your collections.  Connect your metamask wallet to start.
      </Typography>

      <Box sx={{width: '30em' , my: 5, p:4, border: "1px solid #ddd"}}>
        <TextField
          fullWidth={true}
          id="input_wallet"
          label="Wallet address"
          variant="standard" 
          value={walletAddress}
          InputProps={{
            readOnly: true,
          }}
        />
      </Box>
     
      {/* <Box display="flex" alignItems="center" sx={{ color: 'red', ml: 4 }} alignSelf="flex-end">
      <WarningAmberIcon sx={{ marginRight: 0.5 }} /> 
          <Typography >
            Some error here
          </Typography>
        </Box>
      </Box> */}

      <Box sx={{ mt: 8 , mb: 10 }}>
        <Button variant="contained" disabled={loading} sx={{ mt:2 , mb: 4}} onClick={onClickNewCollection}> New Collection</Button>
        {/* <CollectionsTable 
          loading={loading} 
          data={collectionsList} 
          handlePending={checkPendingCollection}
        /> */}
        <NewCollection 
          openModal={openModalNew}
          onClose={onClickCancelNew}
          onSubmitData={onSubmitNewCollection}
          submittingData={submittingData}
          wallet={walletAddress}
        />
      </Box>



    </Box>
  );

}

export default Issue;
