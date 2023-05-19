/* eslint-disable no-nested-ternary */
import { FunctionComponent, useState } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Modal from '../shared/Modal';
import TextField from '@mui/material/TextField';
import Loader from '../shared/Loader';
import metamaskLogo from '/metamask.svg';
import Link from '@mui/material/Link';
import { createNewAccount } from '../../utils/fetch';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { NewAccountResponse } from '../../utils/types';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

type FormValues = {
  input_username: string;
};

const NewAccountModal: FunctionComponent<NewAccountModalProps> = ({
  openModal,
  onClose,
  onConfirmAccount,
  isMetamaskInstalled,
}) => {
  const [values, setValues] = useState<FormValues | null>(null);

  const [submittingData, setSubmittingData] = useState(false);
  const [newAccountDetails, setNewAccountDetails] = useState<NewAccountResponse | null>(
    null,
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevState: any) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmitNewAccount = async () => {
    if (values) {
      try {
        setSubmittingData(true);
        const apiResponse = await createNewAccount(values.input_username);
        if (apiResponse.status == 200) {
          setNewAccountDetails(apiResponse.data);
          setSubmittingData(false);
        }
      } catch (err: any) {
        console.log('An error occurred. Please refresh', err?.message || '');
      }
    }
  };

  return (
    <Modal
      title={isMetamaskInstalled ? 'New Account' : 'Required dependency'}
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
            setNewAccountDetails(null);
            setValues(null);
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
              onSubmitNewAccount();
            } else {
              onConfirmAccount();
              setNewAccountDetails(null);
              setValues(null);
            }
          },
          disabled: submittingData || !isMetamaskInstalled,
        },
      ]}
    >
      <Box>
        <Loader loading={submittingData || false} />
        {!isMetamaskInstalled && (
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 2 }}>
            <img src={metamaskLogo} alt="metamask-logo" style={{ height: '5em' }} />
            <Typography sx={{ mb: 2 }}>
              <Link
                sx={{ color: '#818181', textDecorationColor: 'inherit' }}
                href="https://metamask.io/"
                target="_blank"
              >
                {' '}
                Metamask{' '}
              </Link>
              is required to use this feature. Please install it and then try again.
            </Typography>
          </Box>
        )}
        {newAccountDetails === null && isMetamaskInstalled && (
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
                If you already had an account please make sure if it is active in metamask
                and connected to the application. You might need to refresh your page as
                well.
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

        {newAccountDetails !== null && isMetamaskInstalled && (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Attention</AlertTitle>
              This is your new wallet for ChainWards application. Please make sure to add
              it to metamask or save it in a secure place before closing this window as
              you won't be able to retrieve it again.
            </Alert>
            <Typography style={{ wordWrap: 'break-word', fontWeight: 'bold' }}>
              {' '}
              Public address:
            </Typography>
            <Typography style={{ wordWrap: 'break-word' }}>
              {' '}
              {newAccountDetails.address}{' '}
            </Typography>
            <Typography style={{ wordWrap: 'break-word', fontWeight: 'bold' }}>
              {' '}
              Private key:{' '}
            </Typography>
            <Typography style={{ wordWrap: 'break-word' }}>
              {' '}
              {newAccountDetails.signingKey.privateKey}{' '}
            </Typography>
          </>
        )}
      </Box>
    </Modal>
  );
};

const propTypes = {
  openModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirmAccount: PropTypes.func.isRequired,
  isMetamaskInstalled: PropTypes.bool,
};

type NewAccountModalProps = PropTypes.InferProps<typeof propTypes>;
NewAccountModal.propTypes = propTypes;

NewAccountModal.defaultProps = {
  isMetamaskInstalled: false,
};

export default NewAccountModal;
