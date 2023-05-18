/* eslint-disable no-nested-ternary */
import { FunctionComponent, useState , useEffect} from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Modal from '../shared/Modal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListItemIcon from '@mui/material/ListItemIcon';
import TextField from '@mui/material/TextField';
import { TransitionGroup } from 'react-transition-group';
import Loader from '../shared/Loader';

export type FormValues = {
  input_name: string,
  input_description: string
}

type RenderItemOptions = {
  item: string;
  handleRemoveItem: (item: string) => void;
}


const styles = {
  listItemIcon : {
    minWidth: 0,
    marginRight: '8px'
  }
}

const IssuersList: FunctionComponent<IssuersListProps> = ({
  openModal,
  onClose,
  issuersList,
  onSubmitData,
  submittingData,
}) => { 

  const [ currentList, setCurrentList] = useState<string[]>(issuersList || []);
  const [ inputNewAddress, setInputNewAddress ] = useState('');

  useEffect(() => {
    setCurrentList(issuersList || []);
  }, [issuersList]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputNewAddress(inputValue);
  }

  const handleAddItem = () => {
    if(inputNewAddress !== ""){
      setCurrentList((prev) => [inputNewAddress, ...prev]);
      setInputNewAddress('');
    }
  };

  const handleRemoveItem = (item: string) => {
    setCurrentList((prev) => [...prev.filter((i) => i !== item)]);
  };

  const renderItem = ({ item, handleRemoveItem }: RenderItemOptions) => {
   
    return (
      <ListItem
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            title="Delete"
            onClick={() => handleRemoveItem(item)}
          >
            <RemoveCircleOutlineIcon />
          </IconButton>
        }
      >
        <ListItemIcon sx={styles.listItemIcon}>
          <AccountBalanceWalletIcon />
        </ListItemIcon>
        <ListItemText
          primary={item}
        />
      </ListItem>
    );
  }

  return (
    <Modal
      title="NFT Issuers"
      open={openModal}
      handleClose={() => onClose()}
      actions={[
        {
          name: 'Close',
          color: 'primary',
          variant: 'contained',
          position: 'right',
          size: 'large',
          onClick: () => {
            setCurrentList(issuersList || []);
            onClose();
          },
          disabled: submittingData,
        },
        {
          name: 'Save',
          color: 'primary',
          variant: 'contained',
          position: 'right',
          size: 'large',
          onClick: () => {
            onSubmitData(currentList);
          },
          disabled: submittingData,
        }
      ]}
    >
      
      <Loader loading={submittingData || false} />
      <Typography sx={{mb: 2}}> Add or remove accounts that are allowed to issue (create) NFTs on this collection</Typography>
      
      <Box display="flex" sx={{ color: '#D68100', marginBottom: 1 }}>
        <WarningAmberIcon sx={{ fontSize: '1.3rem', marginRight: 0.5 }} />
        <Typography sx={{ fontSize: '0.875rem' }}>
          Saving your changes to this list requires from a blockchain transaction.
        </Typography>
      </Box>

      <Box display="flex"   sx={{ mt: 1 }}>
        <List >
          <TransitionGroup>
            {currentList.map((item) => (
              <Collapse key={item}>
                {renderItem({ item, handleRemoveItem })}
              </Collapse>
            ))}
          </TransitionGroup>
          <ListItem
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="add"
                title="add"
                onClick={() => handleAddItem()}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            }
          >
            <TextField
              fullWidth={true}
              name="input_address"
              label="new address"
              variant="outlined" 
              value={inputNewAddress}
              margin='normal'
              onChange={handleInputChange}
              size='small'
            />
          </ListItem>
        </List>
      </Box>

    </Modal>
  );
};

const propTypes = {
  openModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  issuersList: PropTypes.arrayOf(PropTypes.string.isRequired),
  onSubmitData: PropTypes.func.isRequired,
  submittingData: PropTypes.bool,
};

type IssuersListProps = PropTypes.InferProps<typeof propTypes>;
IssuersList.propTypes = propTypes

IssuersList.defaultProps = {
  issuersList: [],
  submittingData: false,
};

export default IssuersList;
