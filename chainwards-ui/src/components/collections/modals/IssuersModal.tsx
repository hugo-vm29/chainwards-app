/* eslint-disable no-nested-ternary */
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Loader from '../../shared/Loader';
import Modal from '../../shared/Modal';
import TransactionWarning from '../../shared/TransactionWarning';
import InteractiveList from '../../shared/InteractiveList';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const IssuersModal = ({
  openModal,
  onClose,
  currentIssuers,
  onSubmitData,
}: IssuersModalProps) => {
  const [submittingData, setSubmittingData] = useState(false);
  const [issuerslist, setIssuerslist] = useState<string[]>(currentIssuers);

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
            setSubmittingData(true);
            await onSubmitData(issuerslist);
            setSubmittingData(false);
          },
          disabled: submittingData,
        },
      ]}
    >
      <Box>
        <Loader loading={submittingData} />

        <Typography>
          An issuer is an EOA that you authorized to issue (add) new tokens for this
          collection. This permission is applied on the smart contract that manages your
          collection.
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
  currentIssuers: string[];
  onSubmitData: (data: string[]) => void;
};

IssuersModal.defaultProps = {};

export default IssuersModal;
