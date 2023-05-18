import { FunctionComponent, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgb(227, 227, 227)',
    },
    '&:hover fieldset': {
      border: '1px solid #000000',
    },
    '&.Mui-focused fieldset': {
      border: '1px solid #000000',
    },
    '& input': {
      '&::placeholder': {
        opacity: '1',
        color: '#707070',
      },
    },
  },
});

const SearchField: FunctionComponent<SearchFieldProps>  = ({ searchText, handleSearch, placeholder }) => {
  
  const [timer, setTimer] = useState<any>(null);

  const handleTextChange = (event:any) => {
    clearTimeout(timer);
    const newTimer = setTimeout(() => {
      handleSearch(event.target.value);
    }, 500);
    setTimer(newTimer);
  };

  return (
    <StyledTextField
      margin="normal"
      placeholder={placeholder || 'search'}
      defaultValue={searchText}
      variant="outlined"
      onChange={handleTextChange}
      sx={{
        backgroundColor: '#FAFAFA',
        borderRadius: '4px',
        width: '100%'
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};


const propTypes = {
  searchText: PropTypes.string,
  handleSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

type SearchFieldProps = PropTypes.InferProps<typeof propTypes>;
SearchField.propTypes = propTypes

SearchField.defaultProps = {
  searchText: '',
  placeholder: 'search',
};


export default SearchField;
