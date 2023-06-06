/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Modal from '../shared/Modal';
import TextField from '@mui/material/TextField';
import Loader from '../shared/Loader';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import * as types from '../../utils/types';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

type FormValues = {
  input_username: string;
};

const NewAccountModal = ({
  openModal,
  newAccountDetails,
  submittingData,
  onClose,
  onSubmitData,
  onConfirm,
}: NewAccountModalProps) => {
  const [values, setValues] = useState<FormValues | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevState: any) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <Modal
      title={'New Account'}
      open={openModal}
      handleClose={() => onClose()}
      actions={[
        {
          name: 'Cancel',
          color: 'primary',
          variant: 'outlined',
          position: 'right',
          size: 'large',
          onClick: () => {
            onClose();
          },
          disabled: submittingData || newAccountDetails !== null,
        },
        {
          name: newAccountDetails === null ? 'Create Account' : 'Confirm',
          color: 'primary',
          variant: 'contained',
          position: 'right',
          size: 'large',
          onClick: () => {
            if (newAccountDetails === null) {
              onSubmitData(values?.input_username || '');
            } else {
              onConfirm();
            }
          },
          disabled: submittingData,
        },
      ]}
    >
      <Box>
        <Loader loading={submittingData || false} />
        {newAccountDetails === null && (
          <>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Choose a username to proceed (or just use your name).
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              For your convenience we will generate an ethereum account and all you need
              to do is add it to your metamask wallet.
            </Typography>

            <Box display="flex" sx={{ color: '#D68100', marginBottom: 1 }}>
              <WarningAmberIcon sx={{ fontSize: '1.3rem', marginRight: 0.5 }} />
              <Typography sx={{ fontSize: '0.875rem' }}>
                If you already had an account please make sure it is active and connected
                to the application. You might need to refresh your page as well.
              </Typography>
            </Box>

            <TextField
              required
              fullWidth={true}
              name="input_username"
              label="username"
              variant="outlined"
              value={values?.input_username || ''}
              margin="normal"
              onChange={handleChange}
            />
          </>
        )}

        {newAccountDetails !== null && (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Attention</AlertTitle>
              {
                'This is your new wallet for ChainWards application. Please make sure to add it to metamask or save it in a secure place before closing this window as you wont be able to retrieve it again.'
              }
            </Alert>
            <Typography style={{ wordWrap: 'break-word', fontWeight: 'bold' }}>
              Public address:
            </Typography>
            <Typography style={{ wordWrap: 'break-word' }}>
              {newAccountDetails.address}
            </Typography>
            <Typography style={{ wordWrap: 'break-word', fontWeight: 'bold' }}>
              Private key:
            </Typography>
            <Typography style={{ wordWrap: 'break-word' }}>
              {newAccountDetails.signingKey.privateKey}
            </Typography>
          </>
        )}
      </Box>
    </Modal>
  );
};

type NewAccountModalProps = {
  openModal: boolean;
  submittingData: boolean;
  newAccountDetails: types.NewAccountResponse | null;
  onClose: () => void;
  onSubmitData: (username: string) => void;
  onConfirm: () => void;
};

NewAccountModal.defaultProps = {};

export default NewAccountModal;
