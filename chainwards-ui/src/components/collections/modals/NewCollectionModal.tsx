/* eslint-disable no-nested-ternary */
import { FormEvent, FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TextField from '@mui/material/TextField';
import { Formik, FormikHandlers } from 'formik';
import * as Yup from 'yup';
import Loader from '../../shared/Loader';
import Modal from '../../shared/Modal';

const NewCollectionModal: FunctionComponent<NewCollectionModalProps> = ({
  openModal,
  onClose,
  onSubmitData,
  submittingData,
  networkName,
}) => {
  let handleSubmitForm: (e?: FormEvent<HTMLFormElement> | undefined) => void;

  const bindFormikProps = (formikProps: FormikHandlers) => {
    handleSubmitForm = formikProps.handleSubmit;
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('A name is required.')
      .max(50, 'A maximum of 50 characters is allowed.'),
    description: Yup.string()
      .required('A description is required.')
      .max(200, 'A maximum of 200 characters is allowed.'),
    symbol: Yup.string().max(4, 'A maximum of 4 characters is allowed.'),
  });

  const initialValues = {
    name: '',
    description: '',
    symbol: '',
  };

  return (
    <Modal
      title="New Collection"
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
          disabled: submittingData,
        },
        {
          name: 'Create Collection',
          color: 'primary',
          variant: 'contained',
          position: 'right',
          size: 'large',
          onClick: () => {
            handleSubmitForm();
          },
          disabled: submittingData,
        },
      ]}
    >
      <Box>
        <Loader loading={submittingData || false} />

        <Typography sx={{ mb: 2 }}>
          Complete the information below to create a new NTF collection on the
          {networkName !== '' ? (
            <span>
              <strong> {networkName} </strong>network
            </span>
          ) : (
            <span>blockchain represented by a smart contract.</span>
          )}
        </Typography>

        <Box display="flex" sx={{ color: '#D68100', marginBottom: 1 }}>
          <WarningAmberIcon sx={{ fontSize: '1.3rem', marginRight: 0.5 }} />
          <Typography sx={{ fontSize: '0.875rem' }}>
            This operation involves a blockchain transaction with associated costs so
            please make sure to have enough funds on your wallet.
          </Typography>
        </Box>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={onSubmitData}
          validationSchema={validationSchema}
        >
          {(formik) => {
            bindFormikProps(formik);

            return (
              <>
                <Box display="flex">
                  <TextField
                    fullWidth
                    required
                    variant="outlined"
                    margin="normal"
                    id="name"
                    name="name"
                    label="Collection name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    style={{ marginRight: 8, flexGrow: 1 }}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    id="symbol"
                    name="symbol"
                    label="Symbol"
                    value={formik.values.symbol}
                    onChange={formik.handleChange}
                    error={formik.touched.symbol && Boolean(formik.errors.symbol)}
                    helperText={formik.touched.symbol && formik.errors.symbol}
                  />
                </Box>
                <TextField
                  fullWidth
                  required
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                  id="description"
                  name="description"
                  label="Collection description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </>
            );
          }}
        </Formik>
      </Box>
    </Modal>
  );
};

const propTypes = {
  openModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitData: PropTypes.func.isRequired,
  submittingData: PropTypes.bool,
  networkName: PropTypes.string,
};

type NewCollectionModalProps = PropTypes.InferProps<typeof propTypes>;
NewCollectionModal.propTypes = propTypes;

NewCollectionModal.defaultProps = {
  submittingData: false,
  networkName: '',
};

export default NewCollectionModal;
