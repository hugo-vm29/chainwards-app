import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { FunctionComponent } from 'react';
import Tooltip from '@mui/material/Tooltip';
import LaunchIcon from '@mui/icons-material/Launch';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const styles = {
  root: {
    marginBottom: 2,
  },
  label: {
    color: '#707070',
    marginBottom: 0.5,
  },
  icon: {
    fontSize: 18,
  },
  iconButtons: {
    textTransform: 'none',
    pl: 0,
    color: 'inherit',
    fontWeight: 400,
    fontSize: '1rem',
    padding: 0,
    '&.MuiButton-text:hover': {
      background: 'none',
      color: '#696969',
    },
  },
};

const CardItem: FunctionComponent<CardItemProps> = ({
  label,
  data,
  link,
  tooltipText,
}) => {
  return (
    <Box component="div" sx={styles.root}>
      <Typography variant="body2" sx={styles.label}>
        {label}
      </Typography>
      <Box display="flex" component="div" alignItems="normal">
        {link && link !== '' ? (
          <Tooltip title={tooltipText} arrow placement="right">
            <Button
              disableRipple
              size="large"
              onClick={() => {
                window.open(link, '_blank');
              }}
              sx={styles.iconButtons}
              endIcon={<LaunchIcon />}
            >
              {data}
            </Button>
          </Tooltip>
        ) : (
          <Typography sx={{ mr: 1 }}>{data}</Typography>
        )}
      </Box>
    </Box>
  );
};

const propTypes = {
  label: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  link: PropTypes.string,
  tooltipText: PropTypes.string,
};

type CardItemProps = PropTypes.InferProps<typeof propTypes>;

CardItem.defaultProps = {
  link: '',
  tooltipText: '',
};

export default CardItem;
