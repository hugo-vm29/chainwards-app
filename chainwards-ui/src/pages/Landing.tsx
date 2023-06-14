import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import TokenIcon from '@mui/icons-material/Token';
import CircularProgress from '@mui/material/CircularProgress';
import { useMetamaskContext } from '../contexts/MetamaskProvider';
import { findAccountByWallet, createNewAccount } from '../utils/fetch';
import { setApplicationSession } from '../utils/helpers';
import NewAccountModal from '../components/accounts/NewAccountModal';
import metamaskLogo from '/metamask.svg';
import * as types from '../utils/types';

/* eslint-disable jsx-a11y/anchor-is-valid */

const Landing = () => {
  const navigate = useNavigate();

  const { isMetamaskInstalled, userWallet, connectMetaMask } = useMetamaskContext();

  const [showMetamaskError, setShowMetamaskError] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(false);

  //new account workflow
  const [openNewAccountModal, setOpenNewAccountModal] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [newAccountDetails, setNewAccountDetails] =
    useState<types.NewAccountResponse | null>(null);

  const handleAdminLogin = async () => {
    if (isMetamaskInstalled) {
      if (userWallet !== '') {
        await reviewIfAccountExist(userWallet);
      } else {
        await connectMetaMask();
      }
    } else {
      setShowMetamaskError(true);
    }
  };

  const reviewIfAccountExist = async (address: string) => {
    try {
      setCheckingAccount(true);
      const apiResponse = await findAccountByWallet(address);
      if (apiResponse.status == 200) {
        setApplicationSession(apiResponse.data);
        //navigate('/collections', {replace: true});
        window.location.href = '/collections';
      }
    } catch (err: any) {
      if (
        err?.response.status == 404 &&
        err?.response?.data?.error == 'No account found'
      ) {
        setOpenNewAccountModal(true);
      } else {
        console.log('Unexpected error. Please refresh.', err?.message || '');
      }
    }
  };

  /** NEW ACCOUNT MODAL **/

  const handleSubmitNewAccount = async (username: string) => {
    try {
      setCreatingAccount(true);

      const body = {
        publicAddr: userWallet,
        username: username,
      };

      const apiResponse = await createNewAccount(body);

      if (apiResponse.status === 200) {
        setNewAccountDetails(apiResponse.data);
        setCreatingAccount(false);
      }
    } catch (err: any) {
      console.log('Unexpected error. Please refresh.', err?.message || '');
      onCancelNewAccount();
    }
  };

  const onCancelNewAccount = () => {
    setOpenNewAccountModal(false);
    setNewAccountDetails(null);
    setCheckingAccount(false);
    setCreatingAccount(false);
  };

  const callbackNewAccount = () => {
    setOpenNewAccountModal(false);
    setNewAccountDetails(null);
    setCheckingAccount(false);
    setCreatingAccount(false);
    window.location.reload();
  };

  /** CLAIM A TOKEN (enter as guest user) **/

  const handleGuestLogin = async () => {
    if (isMetamaskInstalled) {
      if (userWallet !== '') {
        navigate('/claim');
      } else {
        await connectMetaMask();
      }
    } else {
      setShowMetamaskError(true);
    }
  };

  return (
    <Grid container>
      <Grid item xs={5} sx={{ pt: '10em', px: 5 }}>
        <Typography variant="h2" noWrap sx={{ mb: 2, fontWeight: 600 }}>
          ChainWards
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 400, mb: 4 }}>
          Create and manage NTFs collections quick and easy !
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 100 }}>
          With just a few clicks you can setup your collection and create as many NFTs as
          you want each one with an individualized list of claimers. The NFTs are
          completly customizable to represent whatever you want.
        </Typography>
      </Grid>
      <Grid item xs={7} sx={{ pt: '5em', px: 5 }}>
        <Container maxWidth="xs">
          <Card sx={{ minWidth: 275, backgroundColor: '#fafafa' }} variant="outlined">
            <CardContent sx={{ minHeight: 400, color: '#818181' }}>
              <Box
                display="flex"
                alignItems="center"
                flexDirection="column"
                sx={{ mt: 2 }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Almost there !
                </Typography>
                <Typography variant="body1">
                  No account is needed to claim a token. An account is required to create
                  collections only.
                </Typography>
                <Typography variant="body2">{`TESTING: ${userWallet}`}</Typography>
              </Box>

              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                sx={{ mt: 5, display: showMetamaskError ? 'none' : 'flex' }}
              >
                {!checkingAccount ? (
                  <>
                    <Button
                      variant="contained"
                      endIcon={<TokenIcon sx={{ fontSize: 50 }} />}
                      size="large"
                      onClick={() => {
                        handleGuestLogin();
                      }}
                    >
                      Claim my NFT
                    </Button>
                    <Link
                      component="button"
                      sx={{ mt: 1.5 }}
                      onClick={() => {
                        handleAdminLogin();
                      }}
                    >
                      Create my collections
                    </Link>
                  </>
                ) : (
                  <Box>
                    <CircularProgress size={51} />
                  </Box>
                )}
              </Box>

              {showMetamaskError && (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  sx={{ mt: 5 }}
                >
                  <img src={metamaskLogo} alt="metamask-logo" style={{ height: '6em' }} />
                  <Typography sx={{ mb: 2 }}>
                    <Link
                      sx={{ color: '#818181', textDecorationColor: 'inherit' }}
                      href="https://metamask.io/"
                      target="_blank"
                    >
                      {' '}
                      Metamask{' '}
                    </Link>
                    is required to use this feature. Please install it and then try again.
                  </Typography>
                  <Link
                    component="button"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      setShowMetamaskError(false);
                    }}
                  >
                    Go back
                  </Link>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Grid>

      <NewAccountModal
        openModal={openNewAccountModal}
        newAccountDetails={newAccountDetails}
        submittingData={creatingAccount}
        onClose={onCancelNewAccount}
        onSubmitData={handleSubmitNewAccount}
        onConfirm={callbackNewAccount}
      />
    </Grid>
  );
};

export default Landing;
