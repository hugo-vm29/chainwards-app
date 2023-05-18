/* eslint-disable no-nested-ternary */
import { FunctionComponent, useState } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Modal from '../shared/Modal';
import TextField from '@mui/material/TextField';
import Loader from '../shared/Loader';


export type FormValues = {
  input_name: string,
  input_description: string
}

const NewCollection: FunctionComponent<NewCollectionProps> = ({
  openModal,
  onClose,
  onSubmitData,
  submittingData,
  wallet
}) => {

  const [values, setValues] = useState<FormValues | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevState: any) => ({
      ...prevState,
      [ event.target.name]: event.target.value,
    }));
  }

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
            onSubmitData(values);
          },
          disabled: submittingData
        }
      ]}
    >
      
      <Box >
        <Loader loading={submittingData || false} />
        <Typography variant="body2" sx={{mb: 2}}>Please complete the information below to deploy a new smart contract to represent your NFT collection.</Typography>
       
        <TextField
          required
          fullWidth={true}
          name="input_name"
          label="Collection Name"
          variant="outlined" 
          value={values?.input_name || ""}
          margin='normal'
          onChange={handleChange}
        />

        <TextField
          multiline
          margin='normal'
          rows={3}
          fullWidth={true}
          name="input_description"
          label="Description"
          variant="outlined" 
          value={values?.input_description || ""}
          onChange={handleChange}
        />

        <TextField
          fullWidth={true}
          name="input_address"
          label="Wallet address"
          variant="outlined" 
          value={wallet}
          InputProps={{
            readOnly: true,
          }}
          margin='normal'
        />

      </Box>

    </Modal>
  );
};

const propTypes = {
  openModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitData: PropTypes.func.isRequired,
  submittingData: PropTypes.bool,
  wallet : PropTypes.string
};

type NewCollectionProps = PropTypes.InferProps<typeof propTypes>;
NewCollection.propTypes = propTypes

NewCollection.defaultProps = {
  submittingData: false,
  wallet: ""
};

export default NewCollection;
