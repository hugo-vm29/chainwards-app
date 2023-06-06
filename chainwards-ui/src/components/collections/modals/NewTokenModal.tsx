/* eslint-disable no-nested-ternary */
import { useState, useRef } from 'react';
import { FormEvent, FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik, FormikProps } from 'formik';
import { ethers } from 'ethers';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import HelpIcon from '@mui/icons-material/Help';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import FormHelperText from '@mui/material/FormHelperText';
import Loader from '../../shared/Loader';
import Modal from '../../shared/Modal';
import InteractiveKeyValue from '../../shared/InteractiveKeyValue';
import { saveTokenMetadata, newListedToken } from '../../../utils/fetch';
import { formatAddress } from '../../../utils/helpers';
import { useMetamaskContext } from '../../../contexts/MetamaskProvider';
import RewardsContract from '../../../contracts/Rewards.json';
import * as types from '../../../utils/types';

const steps = ['NFT details', 'Metadata'];

const styles = {
  labels: {
    fontWeight: '500',
  },
  inputs: {
    mb: 2,
  },
  imageLoader: {
    position: 'relative',
    display: 'block',
    backgroundColor: 'transparent',
    width: 'auto',
    ml: 2,
  },
};

type NewTokenFormValues = {
  name: string;
  description: string;
  claimers: string;
  nft_image: Blob | null;
};

type KeyValueItem = {
  key: string;
  value: string;
};

const NewTokenModal: FunctionComponent<NewTokenModalProps> = ({
  openModal,
  onClose,
  onSubmitCallback,
  contractAddress,
}) => {
  const { chainId, getRpcSigner } = useMetamaskContext();

  const fileInputRef: any = useRef();
  let handleSubmitForm: (e?: FormEvent<HTMLFormElement> | undefined) => void;
  let handleSetFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined,
  ) => void;

  const [activeStep, setActiveStep] = useState(0);
  const [imageName, setImageName] = useState('');
  const [submittingData, setSubmittingData] = useState(false);
  const [metadataList, setMetadataList] = useState<KeyValueItem[]>([]);

  const bindFormikProps = (formikProps: FormikProps<NewTokenFormValues>) => {
    handleSubmitForm = formikProps.handleSubmit;
    handleSetFieldValue = formikProps.setFieldValue;
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const onChangeFile = async (event: { target: any }) => {
    const { target } = event;

    if (target && target.files[0]) {
      const fileItem = target.files[0];
      setImageName(fileItem.name);
      handleSetFieldValue('nft_image', fileItem);
    } else {
      setImageName('');
    }
  };
  const onSubmitForm = async (formValues: NewTokenFormValues) => {
    try {
      setSubmittingData(true);
      //console.log("formValues", formValues);
      const signer: any = await getRpcSigner();

      if (!signer) throw new Error('Unable to get signer account');

      let tokenClaimers = formValues.claimers;
      tokenClaimers += tokenClaimers === '' ? signer.address : ',' + signer.address;

      const tokenDescription =
        formValues.description !== ''
          ? formValues.description
          : `By: ${formatAddress(signer.address)}`;

      /** upload metadata to IPFS **/
      const data = new FormData();
      data.append('file', formValues?.nft_image || '');
      data.append('name', formValues.name);
      data.append('description', tokenDescription);
      data.append('attributes', JSON.stringify(metadataList));
      data.append('claimers', tokenClaimers.toLowerCase());

      const apiResponse = await saveTokenMetadata(data);

      /** send blockchan transaction to list new token in contract **/
      if (apiResponse.status == 200) {
        const contractInstance = new ethers.Contract(
          contractAddress,
          RewardsContract.abi,
          signer,
        );
        let tokenId = await contractInstance.getTokenId();
        tokenId = Number(tokenId) + 1;
        //console.log('tokenId', tokenId);

        const onChainTxn = await contractInstance.createToken(
          apiResponse.data.tokenURI,
          apiResponse.data.merkleRoot,
        );
        //console.log('onChainTxn', onChainTxn);
        //console.log('onChainTxn hash --> ', onChainTxn.hash);

        await onChainTxn.wait();

        const body: types.NewTokenReqBody = {
          tokenId: tokenId,
          issuer: signer.address,
          contract: contractAddress,
          txnHash: onChainTxn.hash,
          chainId: chainId,
          claimers: tokenClaimers.toLowerCase(),
        };

        await newListedToken(body);

        setSubmittingData(false);
        cleanModalData();
        onClose();
        onSubmitCallback();
      }
    } catch (err: any) {
      console.error('Unable to create token. Try again', err?.message || '');
    }
  };

  const handleAddMetadata = (attribute: string, value: string) => {
    const newItem: KeyValueItem = {
      key: attribute,
      value: value,
    };
    setMetadataList((prev) => [newItem, ...prev]);
  };

  const handleRemoveMetadata = (itemKey: string) => {
    setMetadataList((prev) => [...prev.filter((i) => i.key !== itemKey)]);
  };

  const cleanModalData = () => {
    setMetadataList([]);
    setActiveStep(0);
    setImageName('');
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('A name is required.')
      .max(50, 'A maximum of 50 characters is allowed.'),
    description: Yup.string()
      .max(50, 'A maximum of 100 characters is allowed.')
      .required('A description is required.'),
    claimers: Yup.string(),
    nft_image: Yup.mixed().required('Please upload an image'),
  });

  const initialValues: NewTokenFormValues = {
    name: '',
    description: '',
    claimers: '',
    nft_image: null,
  };

  return (
    <Modal
      title="New NFT"
      open={openModal}
      handleClose={() => {
        setImageName('');
        onClose();
      }}
      actions={[
        {
          name: 'Cancel',
          color: 'primary',
          variant: 'outlined',
          position: 'right',
          size: 'large',
          onClick: () => {
            cleanModalData();
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

        <Typography sx={{ mb: 1 }}>
          Add a new NFT to this collection with a whitelist of the ethereum addresses that
          will be able to claim this token. You can change this list later but it will
          require from a new blockchain transaction.
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Additionally, you can also add some metadata to your token.
        </Typography>

        <Box display="flex" sx={{ color: '#D68100', marginBottom: 4 }}>
          <WarningAmberIcon sx={{ fontSize: '1.3rem', marginRight: 0.5 }} />
          <Typography sx={{ fontSize: '0.875rem' }}>
            This operation involves a blockchain transaction with associated costs so
            please make sure to have enough funds on your wallet.
          </Typography>
        </Box>

        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mx: 2, mt: 2, display: activeStep == 0 ? 'block' : 'none' }}>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={onSubmitForm}
            validationSchema={validationSchema}
          >
            {(formik) => {
              bindFormikProps(formik);

              return (
                <>
                  <Typography sx={styles.labels}>* Name: </Typography>
                  <TextField
                    fullWidth
                    required
                    variant="outlined"
                    //margin="normal"
                    id="name"
                    name="name"
                    label=""
                    size="small"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    sx={styles.inputs}
                  />
                  <Typography sx={styles.labels}>Description: </Typography>
                  <TextField
                    fullWidth
                    required
                    variant="outlined"
                    //margin="normal"
                    multiline
                    rows={2}
                    id="description"
                    name="description"
                    //label="Claimers"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.description && Boolean(formik.errors.description)
                    }
                    helperText={formik.touched.description && formik.errors.description}
                    sx={styles.inputs}
                  />

                  <Box display="flex">
                    <Typography sx={[styles.labels, { flexGrow: 1 }]}>
                      Clamiers:{' '}
                    </Typography>
                    <Tooltip
                      title={'Add a list of ethereum addresses separated by comma'}
                      arrow
                      placement="top"
                    >
                      <HelpIcon />
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    required
                    variant="outlined"
                    //margin="normal"
                    multiline
                    rows={2}
                    id="claimers"
                    name="claimers"
                    //label="Claimers"
                    value={formik.values.claimers}
                    onChange={formik.handleChange}
                    error={formik.touched.claimers && Boolean(formik.errors.claimers)}
                    helperText={formik.touched.claimers && formik.errors.claimers}
                    sx={styles.inputs}
                  />
                  <Typography sx={styles.labels}>* Image: </Typography>
                  <Box display="flex" alignItems="end">
                    <Button
                      variant="contained"
                      startIcon={<FileUploadIcon />}
                      onClick={() => {
                        if (fileInputRef && fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                    >
                      Select image
                    </Button>
                    {imageName !== '' && (
                      <Typography sx={{ ml: 1 }}>{imageName}</Typography>
                    )}
                  </Box>
                  <Input
                    type="file"
                    id="nft_image"
                    name="nft_image"
                    inputRef={fileInputRef}
                    sx={{ display: 'none' }}
                    onChange={onChangeFile}
                  />
                  {formik.touched.nft_image && formik.errors.nft_image && (
                    <FormHelperText
                      error={formik.touched.nft_image && Boolean(formik.errors.nft_image)}
                    >
                      <>{formik.errors.nft_image}</>
                    </FormHelperText>
                  )}
                </>
              );
            }}
          </Formik>
        </Box>

        <Box
          sx={{
            mx: 2,
            mt: 2,
            minHeight: '200px',
            display: activeStep == 1 ? 'block' : 'none',
          }}
        >
          <InteractiveKeyValue
            itemsList={metadataList}
            handleAddItem={handleAddMetadata}
            handleRemoveItem={handleRemoveMetadata}
          />
        </Box>
      </Box>
    </Modal>
  );
};

const propTypes = {
  openModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  contractAddress: PropTypes.string.isRequired,
  onSubmitCallback: PropTypes.func.isRequired,
};

type NewTokenModalProps = PropTypes.InferProps<typeof propTypes>;
NewTokenModal.propTypes = propTypes;

NewTokenModal.defaultProps = {};

export default NewTokenModal;
