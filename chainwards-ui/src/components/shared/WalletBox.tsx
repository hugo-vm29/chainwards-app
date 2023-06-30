import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const styles = {
  root: {
    width: '35em',
    maxWidth: '100%',
    height: '5em',
    my: 5,
    p: 3,
    border: '1px solid #ddd',
  },
  label: {
    fontWeight: 'bold',
    mr: 1,
  },
  mainText: {
    wordBreak: 'break-all',
  },
};

const WalletBox = ({ walletAddress }: WalletBoxProps) => {
  return (
    <Box display="flex" justifyContent="left" alignItems="center" sx={styles.root}>
      <Typography sx={styles.label}>My wallet:</Typography>
      <Typography sx={styles.mainText}>{walletAddress}</Typography>
    </Box>
  );
};

type WalletBoxProps = {
  walletAddress: string;
};

WalletBox.defaultProps = {
  walletAddress: '',
};

export default WalletBox;
