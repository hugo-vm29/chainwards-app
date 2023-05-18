import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { FunctionComponent } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import LaunchIcon from '@mui/icons-material/Launch';
import Typography from '@mui/material/Typography';

const styles = {
  root: {
    marginBottom: 2 
  },
  label: {
    color: '#707070',
    marginBottom: 0.5,
  },
  icon: {
    fontSize: 18
  }
};

const CardItem: FunctionComponent<CardItemProps> = ({ label, data, link ,tooltipText }) => {
  
  return (
    <Box component="div" sx={styles.root}>
      <Typography variant="body2" sx={styles.label}>
        {label}
      </Typography>
      <Box display="flex" component="div" alignItems="normal">
        <Typography sx={{ mr: 1}}>{data}</Typography>
        { link && link !== "" &&
          <Tooltip title={tooltipText} arrow placement='right'>
            <Link href={link}><LaunchIcon sx={styles.icon} /></Link>
          </Tooltip>
        }
      </Box>
    </Box>
  );
};

const propTypes = {
  label: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  link: PropTypes.string,
  tooltipText : PropTypes.string
};

type CardItemProps = PropTypes.InferProps<typeof propTypes>;
  
CardItem.defaultProps = {
  link: "",
  tooltipText : ""
};



export default CardItem;
