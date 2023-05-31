import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const styles = {
  root: {
    color: '#D68100',
    my: 2,
  },
  icon: {
    fontSize: '1.3rem',
    marginRight: 0.5,
  },
};

const TransactionWarning = () => {
  return (
    <Box display="flex" sx={styles.root}>
      <WarningAmberIcon sx={styles.icon} />
      <Typography sx={{ fontSize: '0.875rem' }}>
        This operation involves a blockchain transaction with associated costs so please
        make sure to have enough funds on your wallet.
      </Typography>
    </Box>
  );
};

export default TransactionWarning;
