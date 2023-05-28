import { FunctionComponent, useState } from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { TransitionGroup } from 'react-transition-group';

/* eslint-disable @typescript-eslint/no-empty-function */
const InteractiveKeyValue: FunctionComponent<InteractiveKeyValueProps> = ({
  itemsList,
  handleAddItem,
  handleRemoveItem,
}) => {
  const [inputsState, setInputsState] = useState({
    attribute: '',
    value: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputsState({
      ...inputsState,
      [event.target.name]: event.target.value,
    });
  };

  const clickAddItem = () => {
    if (inputsState.attribute !== '' && inputsState.value !== '') {
      handleAddItem(inputsState.attribute, inputsState.value);
      setInputsState({
        attribute: '',
        value: '',
      });
    }
  };

  const renderItem = (itemKey: string, itemValue: string) => {
    return (
      <ListItem
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            title="Delete"
            onClick={() => {
              handleRemoveItem(itemKey);
            }}
          >
            <RemoveCircleOutlineIcon />
          </IconButton>
        }
      >
        <TextField
          fullWidth={true}
          name="key"
          variant="outlined"
          value={itemKey}
          hiddenLabel
          size="small"
          disabled
          sx={{ mr: 1 }}
        />
        <TextField
          fullWidth={true}
          name="key"
          variant="outlined"
          value={itemValue}
          hiddenLabel
          size="small"
          disabled
        />
      </ListItem>
    );
  };

  return (
    <List>
      <TransitionGroup>
        {itemsList.map((item) => (
          <Collapse key={item.key}>{renderItem(item.key, item.value)}</Collapse>
        ))}
      </TransitionGroup>
      <ListItem
        sx={{ mt: 4 }}
        secondaryAction={
          <IconButton edge="end" aria-label="add" title="add" onClick={clickAddItem}>
            <AddCircleOutlineIcon />
          </IconButton>
        }
      >
        <TextField
          fullWidth={true}
          name="attribute"
          label="attribute"
          variant="outlined"
          value={inputsState.attribute}
          onChange={handleInputChange}
          size="small"
          sx={{ mr: 1 }}
        />
        <TextField
          fullWidth={true}
          name="value"
          label="value"
          variant="outlined"
          value={inputsState.value}
          onChange={handleInputChange}
          size="small"
        />
      </ListItem>
    </List>
  );
};

const propTypes = {
  itemsList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  handleRemoveItem: PropTypes.func.isRequired,
  handleAddItem: PropTypes.func.isRequired,
};

type InteractiveKeyValueProps = PropTypes.InferProps<typeof propTypes>;

InteractiveKeyValue.propTypes = propTypes;
InteractiveKeyValue.defaultProps = {
  itemsList: [],
  handleRemoveItem: () => {},
  handleAddItem: () => {},
};

export default InteractiveKeyValue;
