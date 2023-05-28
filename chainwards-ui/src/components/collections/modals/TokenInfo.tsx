/* eslint-disable no-nested-ternary */
import { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Loader from '../../shared/Loader';
import Modal from '../../shared/Modal';

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

const TokenInfo: FunctionComponent<TokenInfoProps> = ({ openModal, onClose }) => {
  return (
    <Modal
      title="Token Info"
      open={openModal}
      handleClose={() => {
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
            onClose();
          },
          disabled: false,
        },
        {
          name: 'Create Collection',
          color: 'primary',
          variant: 'contained',
          position: 'right',
          size: 'large',
          //onClick: () => {},
          disabled: false,
        },
      ]}
    >
      <Box>
        <Loader loading={false} />

        <Typography sx={{ mb: 2 }}>New token</Typography>
      </Box>
    </Modal>
  );
};

const propTypes = {
  openModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

type TokenInfoProps = PropTypes.InferProps<typeof propTypes>;
TokenInfo.propTypes = propTypes;

TokenInfo.defaultProps = {};

export default TokenInfo;
