import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Tooltip from '@mui/material/Tooltip';
import Loader from '../components/shared/Loader';
import { getTokensToClaim, mintToken } from '../utils/fetch';
import { useMetamaskContext } from '../contexts/MetamaskProvider';
import Avatar from '@mui/material/Avatar';
import * as types from '../utils/types';
import RewardsContract from '../contracts/Rewards.json';
import { BASE_METADATA_URI } from '../utils/constants';
import PolygonIcon from '../assets/PolygonIcon';
import EthereumIcon from '../assets/EthereumIcon';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const styles = {
  rootContainer: {
    py: 2,
    px: 4,
  },
  loader: {
    mt: 4,
    position: 'relative',
    //display: 'block',
    backgroundColor: 'transparent',
  },
  networkIcon: {
    height: '1.2rem',
    width: '1.2rem',
    alignSelf: 'start',
  },
};

const Claim = () => {
  const { userWallet, chainId, getRpcSigner } = useMetamaskContext();

  const [loadingData, setLoadingData] = useState(false);
  const [tokensToClaim, setTokensToClaim] = useState<types.TokenToClaim[]>([]);

  const [submittingMint, setSubmittingMint] = useState(false);
  const [tokenToMint, setTokenToMint] = useState('');

  const [toastAlertContent, setToastAlertContent] = useState({
    open: false,
    variant: '',
    message: '',
  });

  const timer = useRef<number>();

  const getNetworkIcon = (networkId: number) => {
    if (networkId === 5) {
      return <EthereumIcon style={{ ...styles.networkIcon }} />;
    } else if (networkId == 80001) {
      return <PolygonIcon style={{ ...styles.networkIcon }} />;
    }
    return <></>;
  };

  const processToken = async (
    item: types.ClaimableTokensResponse,
    signer: ethers.JsonRpcSigner,
  ) => {
    try {
      const contractInstance = new ethers.Contract(
        item.collectionInfo.contractAddress,
        RewardsContract.abi,
        signer,
      );

      const tokenId = item.tokenId;
      const tokenURI = await contractInstance.uri(tokenId);
      const metaReq = await axios.get(tokenURI);

      if (metaReq.status == 200) {
        const metaData = metaReq.data;

        const tokenItem: types.TokenToClaim = {
          claimRequestId: item._id,
          tokenId: item.tokenId,
          tokenName: metaData.name,
          image: metaData.image.replace('ipfs://', ''),
          collectionName: item.collectionInfo.name,
          collectionId: item.collectionInfo._id,
          chainId: item.chainId,
        };
        return tokenItem;
      }
    } catch (err: any) {
      console.error('Unable to retrieve token data', err?.message || '');
    }
  };

  const listTokensToClaim = async (walletAddress: string) => {
    try {
      setLoadingData(true);
      const apiResponse = await getTokensToClaim(walletAddress);

      if (apiResponse.status == 200) {
        //console.log('apiResponse', apiResponse.data);

        const signer: any = await getRpcSigner();
        if (!signer) throw new Error('Unable to get signer account');

        const promesas: any[] = [];
        apiResponse.data.map((item: types.ClaimableTokensResponse) => {
          promesas.push(processToken(item, signer));
        });

        const tokensList = await Promise.all(promesas);
        setTokensToClaim(tokensList);
        setLoadingData(false);
      }
    } catch (err: any) {
      setLoadingData(false);
      console.log('Unable to retrieve data', err?.message || '');
    }
  };

  const handleClaimToken = async (item: types.TokenToClaim) => {
    try {
      setSubmittingMint(true);
      setTokenToMint(item.claimRequestId);

      const bodyData = {
        tokenId: item.tokenId,
        collectionId: item.collectionId,
        addressTo: userWallet,
      };

      const apiResponse = await mintToken(bodyData);

      if (apiResponse.status == 200) {
        if (apiResponse.data.txnStatus === 1) {
          setLoadingData(true);
          setSubmittingMint(false);
          setTokenToMint('');
          showToastAlert('success', 'Token minted successfully !!');
          let copyList = [...tokensToClaim];
          copyList = copyList.filter(
            (item) => item.claimRequestId !== apiResponse.data.mintedItemId,
          );
          setTokensToClaim(copyList);
          setLoadingData(false);
        } else {
          setSubmittingMint(false);
          setTokenToMint('');
          showToastAlert('error', 'An error have ocurred. Please try again.');
        }
      }
    } catch (err: any) {
      setSubmittingMint(false);
      setTokenToMint('');
      showToastAlert('error', 'An error have ocurred. Please try again.');
      console.error('Unable to retrieve token data', err?.message || '');
    }
  };

  useEffect(() => {
    if (userWallet !== '') {
      listTokensToClaim(userWallet);
    }

    return () => {
      clearTimeout(timer.current);
    };
  }, [userWallet]);

  /** toast alert **/

  const handleToastClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastAlertContent({ ...toastAlertContent, open: false });
  };

  const showToastAlert = (type: string, message: string) => {
    setToastAlertContent({ open: true, variant: type, message });
  };

  return (
    <Box component="div" sx={styles.rootContainer}>
      <Box
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
        sx={{ mt: 4, mb: 8 }}
      >
        <Typography variant="h4"> Claim Your NFT</Typography>
        <Typography sx={{ my: 2 }}>
          Use your metamask account or any ethereum account to claim your NFTs !
        </Typography>

        <Stack direction="row" sx={{ mt: 5, p: 3, border: '1px solid #ddd' }}>
          <Typography sx={{ mr: 2, fontWeight: 'bold' }}> My Wallet </Typography>
          <Typography> {userWallet} </Typography>
        </Stack>

        <Loader loading={loadingData} sx={styles.loader} size={50} />

        {!loadingData && userWallet !== '' && tokensToClaim.length == 0 && (
          <>
            <SentimentVeryDissatisfiedIcon sx={{ mt: 5, mb: 1, fontSize: 50 }} />
            <Typography variant="h6">No NFTs for you at this moment</Typography>
          </>
        )}
      </Box>

      {!loadingData && userWallet !== '' && tokensToClaim.length > 0 && (
        <Stack direction="row" spacing={4} sx={{ mx: 4 }}>
          {tokensToClaim.map((item: types.TokenToClaim, index: number) => (
            <Badge key={index} badgeContent={getNetworkIcon(item.chainId)}>
              <Stack direction="column" spacing={2} sx={{ alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 150,
                    height: 150,
                    bgcolor: 'transparent',
                    border: '1px solid #eaeaea',
                    marginTop: '0 !important',
                  }}
                >
                  <img
                    src={`${BASE_METADATA_URI}${item.image}?fit=crop&auto=format`}
                    srcSet={`${BASE_METADATA_URI}${item.image}?fit=crop&auto=format&dpr=2 2x`}
                    alt={item.tokenName}
                    loading="lazy"
                    style={{ position: 'absolute', height: '90%' }}
                  />
                  <Box
                    component="div"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      background: 'rgba(0, 0, 0, 0.7)',
                      position: 'absolute',
                      top: 0,
                      height: '100%',
                      width: '100%',
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontWeight: 500, fontSize: 18 }}>
                      {' '}
                      {item.tokenName}{' '}
                    </Typography>
                    <Typography sx={{ color: '#fff', textAlign: 'center', fontSize: 10 }}>
                      {' '}
                      {item.collectionName}{' '}
                    </Typography>
                  </Box>
                </Avatar>
                <Box sx={{ m: 1, position: 'relative' }}>
                  <Tooltip
                    title={
                      item.chainId !== chainId ? 'token is from another network' : ''
                    }
                    arrow
                    placement="right"
                  >
                    <Button
                      variant="contained"
                      disabled={submittingMint || chainId !== item.chainId}
                      onClick={() => handleClaimToken(item)}
                    >
                      Claim
                    </Button>
                  </Tooltip>
                  {submittingMint && tokenToMint === item.claimRequestId && (
                    <Tooltip
                      title={'minting your token, this can take a few minutes'}
                      arrow
                      placement="right"
                    >
                      <CircularProgress
                        size={24}
                        sx={{
                          color: '#fff',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: '-12px',
                          marginLeft: '-12px',
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
              </Stack>
            </Badge>
          ))}
        </Stack>
      )}

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={toastAlertContent.open}
        autoHideDuration={6000}
        onClose={handleToastClose}
      >
        <Alert
          onClose={handleToastClose}
          severity={
            toastAlertContent.variant == 'success'
              ? 'success'
              : toastAlertContent.variant == 'error'
              ? 'error'
              : toastAlertContent.variant == 'warning'
              ? 'warning'
              : 'info'
          }
          sx={{ width: '100%' }}
        >
          {toastAlertContent.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Claim;
