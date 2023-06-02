/* eslint-disable no-nested-ternary */
import { FunctionComponent, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Loader from '../../shared/Loader';
import Modal from '../../shared/Modal';
import TransactionWarning from '../../shared/TransactionWarning';
import InteractiveList from '../../shared/InteractiveList';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { updateCollectionIssuers } from '../../../utils/fetch';
import { useMetamaskContext } from '../../../contexts/MetamaskProvider';
import RewardsContract from '../../../contracts/Rewards.json';
import * as types from '../../../utils/types';

const IssuersModal = ({openModal, onClose, currentIssuers, collectionId  , contractAddress}: IssuersModalProps ) => {

  const { getRpcSigner } = useMetamaskContext();
  const [submittingData, setSubmittingData] = useState(false);
  const [issuerslist , setIssuerslist] = useState<string[]>([]);

  const addItem = (newItem: string) => {
    setIssuerslist((prev) => [newItem, ...prev]);
  };

  const removeItem = (toRemove: string) => {
    setIssuerslist((prev) => [...prev.filter((i) => i !== toRemove)]);
  };

  const resetModal = () => {
    setIssuerslist(currentIssuers);
    onClose();
  };

  const submitChanges = async () => {
    try {
      
      setSubmittingData(true);
      let newData = issuerslist.toString();
      let toAdd = issuerslist.filter( x => !currentIssuers.includes(x));
      let toRemove = currentIssuers.filter( x => !issuerslist.includes(x));

      console.log("toAdd -> ", toAdd);
      console.log("toRemove -> ", toRemove);
      console.log("newData -> ", newData);
      
       /*const signer: any = await getRpcSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        RewardsContract.abi,
        signer,
      );
      const onChainTxn = await contractInstance.updateTokenIssuersBatch(
        toAdd,
        toRemove,
      );
      await onChainTxn.wait();

      const body: types.PatchIssuersReqBody = {
        collectionId: collectionId,
        newIssuers: newData,
        from: signer.address,
        txnHash: onChainTxn.hash,
      };
      const patchRequest = await updateCollectionIssuers(body);

     
        setSubmittingData(false);
        onClose();
        submitCallback(tokenInfo.tokenId, patchRequest.data.whitelist);*/

    } catch (err: any) {
      console.error('Unable to update claimers', err?.message || '');
      setSubmittingData(false);
      resetModal();
    }
  };

  useEffect(() => {
    setIssuerslist(currentIssuers);
  }, [currentIssuers]);

  return (
    <Modal
      title="NFT Issuers"
      open={openModal}
      handleClose={() => {
        resetModal();
      }}
      actions={[
        {
          name: 'Cancel',
          color: 'primary',
          variant: 'outlined',
          position: 'right',
          size: 'large',
          onClick: () => {
            resetModal();
          },
          disabled: submittingData,
        },
        {
          name: 'Save Changes',
          color: 'primary',
          variant: 'contained',
          position: 'right',
          size: 'large',
          onClick: async () => {
            await submitChanges();
          },
          disabled: submittingData,
        },
      ]}
    >
      <Box>
        <Loader loading={submittingData} />

        <Typography>
          An issuer is an EOA that you authorized to issue (add) new tokens for this collection. This permission is applied on the smart contract that manages your collection.
        </Typography>
        <Typography>
         Issuers must register as admins in the platform to get a valid wallet address.
        </Typography>

        <TransactionWarning />

        <InteractiveList
          handleAddItem={addItem}
          handleRemoveItem={removeItem}
          itemsList={issuerslist}
          itemsIcon={<AccountBalanceWalletIcon />}
        />

      </Box>
    </Modal>
  );
};


type IssuersModalProps = {
  openModal: boolean;
  onClose: () => void;
  currentIssuers: string[]
  collectionId: string;
  contractAddress: string;
}

IssuersModal.defaultProps = {};

export default IssuersModal;
