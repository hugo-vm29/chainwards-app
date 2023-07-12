import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';

const useStyles = (_theme: Theme) => {
  return {
    root: {
      width: '35em',
      maxWidth: '100%',
      height: '5em',
      my: 5,
      p: 3,
      //border: `2px solid ${_theme.palette.secondary.main}`,
      backgroundColor: _theme.palette.secondary.light,
      color: _theme.palette.secondary.contrastText,
    },
    label: {
      fontWeight: 'bold',
      mr: 1,
    },
    mainText: {
      wordBreak: 'break-all',
    },
  };
};

const WalletBox = ({ walletAddress }: WalletBoxProps) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return (
    <Box display="flex" justifyContent="left" alignItems="center" sx={classes.root}>
      <Typography sx={classes.label}>My wallet:</Typography>
      <Typography sx={classes.mainText}>{walletAddress}</Typography>
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
