import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CollectionsTable from '../components/collections/CollectionsTable';
import NewCollectionModal from '../components/collections/modals/NewCollectionModal';
import { useMetamaskContext } from '../contexts/MetamaskProvider';
import RewardsContract from '../contracts/Rewards.json';
import * as types from '../utils/types';
import {
  getCollectionsForAccount,
  saveNewCollection,
  checkPendingTxnForCollection,
} from '../utils/fetch';
import { getNetworkName } from '../utils/helpers';
import { BASE_METADATA_URI } from '../utils/constants';

const provider = new ethers.BrowserProvider(window.ethereum);

const Collections = () => {
  const { walletAddress, chainId, getRpcSigner } = useMetamaskContext();

  const [collectionsList, setCollectionsList] = useState<types.CollectionsRow[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);

  const [openModalNew, setOpenModalNew] = useState(false);
  const [submittingNew, setSubmittingNew] = useState(false);
  const [networkName, setNetworkName] = useState('');

  const getCollections = useCallback(async (address: string) => {
    if (address !== '') {
      setLoadingTable(true);
      const response = await getCollectionsForAccount(address, chainId);
      if (response.status == 200) {
        setCollectionsList(response.data);
      }
      setLoadingTable(false);
    }
    return false;
  }, []);

  useEffect(() => {
    if (chainId !== 0) {
      const networkName = getNetworkName(chainId);
      setNetworkName(networkName);
      getCollections(walletAddress);
    }
  }, [chainId, walletAddress]);

  const onClickNewCollection = () => {
    setOpenModalNew(true);
  };

  const onClickCancelNew = () => {
    setOpenModalNew(false);
  };

  const onSubmitNewCollection = async (formValues: types.NewCollectionFormValues) => {
    try {
      setSubmittingNew(true);
      const signer: any = await getRpcSigner();

      const factory = new ethers.ContractFactory(
        RewardsContract.abi,
        RewardsContract.bytecode,
        signer,
      );

      const contractInstance = await factory.deploy(
        formValues.name,
        formValues.symbol,
        BASE_METADATA_URI,
      );
      //const ctAddress = await contractInstance.getAddress();
      const deployTransaction = contractInstance.deploymentTransaction();

      const body: types.NewCollectionReqBody = {
        deployAddress: signer.address.toLowerCase(),
        txnHash: deployTransaction?.hash || '',
        chainId: chainId.toString(),
        collectionInfo: {
          name: formValues.name,
          symbol: formValues.symbol,
          description: formValues.description,
        },
      };

      // const body: types.NewCollectionReqBody = {
      //   deployAddress: signer.address.toLowerCase(),
      //   txnHash: "0xcf2e83617ae8befb96753ecb350ad4274fa735a81a01d7663157f647473e3132",
      //   chainId: chainId.toString(),
      //   collectionInfo: {
      //     name: "Awesome Collection 1",
      //     symbol: "AW1",
      //     description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vestibulum quis odio et pretium. Suspendisse sollicitudin est id dui interdum, vitae blandit nibh porta.",
      //   }
      // }

      const apiResponse = await saveNewCollection(body);
      console.log('api response : ', apiResponse.data);

      setOpenModalNew(false);
      setSubmittingNew(false);
      await getCollections(signer.address);
    } catch (err: any) {
      setSubmittingNew(false);
      setOpenModalNew(false);
      console.log('An error has ocurred', err?.info?.error || '');
    }
  };
  
  const checkPendingDeployment = async (transactionId: string) => {
    try {
      setLoadingTable(true);
      //console.log("transactionId", transactionId);
      const response: any = await checkPendingTxnForCollection(transactionId); //collectionId

      if (response.status == 200) {
        if (response.data.transactionStatus == 'completed') {
          const newData: types.CollectionsRow[] = [...collectionsList];
          const findRow: types.CollectionsRow | undefined = newData.find(
            (x) => x._id == transactionId,
          );
          if (findRow) {
            findRow.contractAddress = response.data.contractAddress;
            findRow.transactionStatus = response.data.transactionStatus;
            setCollectionsList(newData);
          }
        }
      }
    } catch (err: any) {
      console.log('An error has ocurred, please refresh page', err?.message || '');
    }

    setLoadingTable(false);
  };

  return (
    <Box component="div" sx={{ py: 2, px: 4 }}>
      <Typography variant="h4"> My Collections</Typography>
      <Typography sx={{ my: 2 }}>
        From this page you can create a new NFT collection for your reward program which
        will be represented by a smart contract. You can also view a list of all the
        collections associated to your active account.
      </Typography>

      <Box sx={{ width: '30em', my: 5, p: 3, border: '1px solid #ddd' }}>
        <Typography>
          <strong>My wallet: </strong>
          {walletAddress}
        </Typography>
      </Box>

      <Box sx={{ mt: 8, mb: 10 }}>
        <Button
          variant="contained"
          disabled={submittingNew}
          sx={{ mt: 2, mb: 4 }}
          onClick={onClickNewCollection}
        >
          New Collection
        </Button>

        <CollectionsTable
          loading={loadingTable}
          data={collectionsList}
          handlePending={checkPendingDeployment}
        />

        <NewCollectionModal
          openModal={openModalNew}
          onClose={onClickCancelNew}
          onSubmitData={onSubmitNewCollection}
          submittingData={submittingNew}
          networkName={networkName}
        />
      </Box>
    </Box>
  );
};

export default Collections;
