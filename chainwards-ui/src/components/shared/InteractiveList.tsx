import { FunctionComponent, useState } from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { TransitionGroup } from 'react-transition-group';

const styles = {
  listItemIcon: {
    minWidth: 0,
    marginRight: '8px',
  },
};

/* eslint-disable @typescript-eslint/no-empty-function */
const InteractiveList: FunctionComponent<InteractiveListProps> = ({
  itemsList,
  handleAddItem,
  handleRemoveItem,
}) => {
  const [inputNewItem, setInputNewItem] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputNewItem(inputValue);
  };

  const clickAddItem = () => {
    const newItem = inputNewItem;
    setInputNewItem('');
    handleAddItem(newItem);
  };

  const renderItem = (text: string) => {
    return (
      <ListItem
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            title="Delete"
            onClick={() => handleRemoveItem && handleRemoveItem(text)}
          >
            <RemoveCircleOutlineIcon />
          </IconButton>
        }
      >
        <ListItemIcon sx={styles.listItemIcon}>
          <AccountBalanceWalletIcon />
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItem>
    );
  };

  return (
    <List>
      <TransitionGroup>
        {itemsList?.map((item) => (
          <Collapse key={item}>{renderItem(item)}</Collapse>
        ))}
      </TransitionGroup>
      <ListItem
        secondaryAction={
          <IconButton edge="end" aria-label="add" title="add" onClick={clickAddItem}>
            <AddCircleOutlineIcon />
          </IconButton>
        }
      >
        <TextField
          fullWidth={true}
          name="input_address"
          label="new address"
          variant="outlined"
          value={inputNewItem}
          margin="normal"
          onChange={handleInputChange}
          size="small"
        />
      </ListItem>
    </List>
  );
};

const propTypes = {
  itemsList: PropTypes.arrayOf(PropTypes.string.isRequired),
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
    ),
    PropTypes.func,
    PropTypes.object,
  ]),
  handleRemoveItem: PropTypes.func.isRequired,
  handleAddItem: PropTypes.func.isRequired,
};

type InteractiveListProps = PropTypes.InferProps<typeof propTypes>;

InteractiveList.propTypes = propTypes;
InteractiveList.defaultProps = {
  itemsList: [],
  handleRemoveItem: () => {},
  handleAddItem: () => {},
};

export default InteractiveList;
