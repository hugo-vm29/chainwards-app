/* eslint-disable no-nested-ternary */
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Loader from '../../shared/Loader';
import Modal from '../../shared/Modal';
import TransactionWarning from '../../shared/TransactionWarning';
import InteractiveList from '../../shared/InteractiveList';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { newMerkleRoot, updateTokenClaimers } from '../../../utils/fetch';
import { useMetamaskContext } from '../../../contexts/MetamaskProvider';
import RewardsContract from '../../../contracts/Rewards.json';
import * as types from '../../../utils/types';

const ViewClaimersModal = ({
  tokenInfo,
  contractAddress,
  collectionId,
  submitCallback,
  openModal,
  onClose,
  canModify,
}: ViewClaimersModalProps) => {
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
    setClaimersList(tokenInfo.whitelist);
    onClose();
  };

  const submitChangeClaimers = async () => {
    try {
      setSubmittingData(true);
      let tokenClaimers = claimersList.toString();
      tokenClaimers +=
        tokenClaimers === '' ? tokenInfo.tokenIssuer : ',' + tokenInfo.tokenIssuer;

      const apiReq = await newMerkleRoot(tokenClaimers);

      /** send blockchan transaction to update the merkle root for token in the contract **/
      if (apiReq.status === 200) {
        const signer: any = await getRpcSigner();

        if (!signer) throw new Error('Unable to get signer account');

        const contractInstance = new ethers.Contract(
          contractAddress,
          RewardsContract.abi,
          signer,
        );

        const newMerkleRoot = apiReq.data.merkleRoot;
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
        setSubmittingData(false);
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
    setClaimersList(tokenInfo.whitelist);
  }, [tokenInfo.whitelist]);

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
        {canModify ? (
          <>
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
          </>
        ) : (
          <>
            <List>
              {tokenInfo.whitelist.map((item, index) => (
                <div key={index}>
                  <ListItem sx={{ my: 1 }}>
                    <ListItemIcon>
                      <AccountBalanceWalletIcon />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </div>
              ))}
            </List>
            {tokenInfo.whitelist.length == 0 && (
              <Typography variant="h6" sx={{ fontStyle: 'italic', fontWeight: 'normal' }}>
                This token have no whitelist.
              </Typography>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

type ViewClaimersModalProps = {
  openModal: boolean;
  onClose: () => void;
  tokenInfo: {
    whitelist: string[];
    tokenIssuer: string;
    tokenId: number;
  };
  collectionId: string;
  contractAddress: string;
  submitCallback: (tokenId: number, newList: string[]) => void;
  canModify: boolean;
};

ViewClaimersModal.defaultProps = {
  readOnly: false,
};

export default ViewClaimersModal;
