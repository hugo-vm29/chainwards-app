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
import { newMerkleRoot, updateTokenClaimers } from '../../../utils/fetch';
import { useMetamaskContext } from '../../../contexts/MetamaskProvider';
import RewardsContract from '../../../contracts/Rewards.json';
import * as types from '../../../utils/types';

/*const styles = {
  labels: {
    fontWeight: "500",
  },
  inputs: {
    mb: 2,
  },
  imageLoader: {
    position: "relative", 
    display: "block", 
    backgroundColor: "transparent",
    width: "auto",
    ml: 2
  }
}*/

const ViewClaimersModal: FunctionComponent<ViewClaimersModalProps> = ({
  tokenInfo,
  contractAddress,
  collectionId,
  submitCallback,
  openModal,
  onClose,
}) => {
  const { getRpcSigner } = useMetamaskContext();
  const [claimersList, setClaimersList] = useState<string[]>([]);
  const [submittingData, setSubmittingData] = useState(false);

  const addAddress = (newItem: string) => {
    setClaimersList((prev) => [newItem, ...prev]);
  };

  const removeddress = (toRemove: string) => {
    setClaimersList((prev) => [...prev.filter((i) => i !== toRemove)]);
  };

  const resetModal = () => {
    setClaimersList(tokenInfo.currentList);
    onClose();
  };

  const submitChangeClaimers = async () => {
    try {
      //setSubmittingData(true);
      let tokenClaimers = claimersList.toString();
      tokenClaimers +=
        tokenClaimers === '' ? tokenInfo.tokenIssuer : ',' + tokenInfo.tokenIssuer;

      const apiReq = await newMerkleRoot(tokenClaimers);

      /** send blockchan transaction to update the merkle root for token in the contract **/
      if (apiReq.status === 200) {
        const signer: any = await getRpcSigner();
        const newMerkleRoot = apiReq.data.merkleRoot;

        const contractInstance = new ethers.Contract(
          contractAddress,
          RewardsContract.abi,
          signer,
        );

        const onChainTxn = await contractInstance.setMerkleRoot(
          tokenInfo.tokenId,
          newMerkleRoot,
        );
        await onChainTxn.wait();

        const body: types.PatchClaimersReqBody = {
          tokenId: tokenInfo.tokenId,
          collectionId: collectionId,
          newClaimers: tokenClaimers,
          from: signer.address,
          txnHash: onChainTxn.hash,
        };

        const patchRequest = await updateTokenClaimers(body);
        onClose();
        submitCallback(tokenInfo.tokenId, patchRequest.data.whitelist);
      }
    } catch (err: any) {
      console.error('Unable to update claimers', err?.message || '');
      setSubmittingData(false);
      resetModal();
    }
  };

  useEffect(() => {
    setClaimersList(tokenInfo.currentList);
  }, [tokenInfo.currentList]);

  return (
    <Modal
      title="Claimers (whitelist)"
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
            await submitChangeClaimers();
          },
          disabled: submittingData,
        },
      ]}
    >
      <Box>
        <Loader loading={submittingData} />

        <Typography>
          View and modify the ethereum accounts (EOA) that are allowed to claim this
          token.
        </Typography>

        <TransactionWarning />

        <InteractiveList
          handleAddItem={addAddress}
          handleRemoveItem={removeddress}
          itemsList={claimersList}
          itemsIcon={<AccountBalanceWalletIcon />}
        />
      </Box>
    </Modal>
  );
};

const propTypes = {
  openModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tokenInfo: PropTypes.shape({
    currentList: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    tokenIssuer: PropTypes.string.isRequired,
    tokenId: PropTypes.number.isRequired,
  }).isRequired,
  collectionId: PropTypes.string.isRequired,
  contractAddress: PropTypes.string.isRequired,
  submitCallback: PropTypes.func.isRequired,
};

type ViewClaimersModalProps = PropTypes.InferProps<typeof propTypes>;
ViewClaimersModal.propTypes = propTypes;

ViewClaimersModal.defaultProps = {};

export default ViewClaimersModal;
