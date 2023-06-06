/* eslint-disable no-nested-ternary */
import { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Modal from '../../shared/Modal';
import Typography from '@mui/material/Typography';

const ViewOwnersModal: FunctionComponent<ViewOwnersModalProps> = ({
  openModal,
  onClose,
  ownersList,
}) => {
  return (
    <Modal
      title="Owned by"
      open={openModal}
      handleClose={() => {
        onClose();
      }}
      actions={[]}
      closeButton
    >
      <Box>
        <List>
          {ownersList?.map((item, index) => (
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
        {ownersList?.length == 0 && (
          <Typography variant="h6" sx={{ fontStyle: 'italic', fontWeight: 'normal' }}>
            No one own this token
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

const propTypes = {
  openModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  ownersList: PropTypes.arrayOf(PropTypes.string.isRequired),
};

type ViewOwnersModalProps = PropTypes.InferProps<typeof propTypes>;
ViewOwnersModal.propTypes = propTypes;

ViewOwnersModal.defaultProps = {
  ownersList: [],
};

export default ViewOwnersModal;
