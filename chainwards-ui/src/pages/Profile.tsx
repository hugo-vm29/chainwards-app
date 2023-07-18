import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Loader from '../components/shared/Loader';
import { useMetamaskContext } from '../contexts/MetamaskProvider';
import PolygonIcon from '../assets/PolygonIcon';
import EthereumIcon from '../assets/EthereumIcon';
import LaunchIcon from '@mui/icons-material/Launch';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import * as types from '../utils/types';
import WalletBox from '../components/shared/WalletBox';
import { BASE_METADATA_URI } from '../utils/constants';
import { formatLongName } from '../utils/helpers';
import { getTokensOwnedTokens } from '../utils/fetch';

const styles = {
  rootContainer: {
    py: 2,
    px: 4,
  },
  loader: {
    mt: 4,
    position: 'relative',
    backgroundColor: 'transparent',
    alignItems: 'left',
    justifyContent: 'left',
  },
  networkIcon: {
    width: '1.3rem',
    mr: 5,
  },
  detailsSection: {
    pt: 1,
    pb: 0.5,
    px: 2,
    // '& .MuiImageListItemBar-title': {
    //   whiteSpace: "normal",
    // },
  },
  collectionTitle: {
    color: '#bababa',
    //wordBreak: 'break-all',
    fontSize: '18px',
    mb: 1,
  },
  tokenName: {
    fontSize: '16px',
  },
};

const MyProfile = () => {
  const { userWallet } = useMetamaskContext();
  const timer = useRef<number>();

  const [loadingData, setLoadingData] = useState(false);
  const [tokensList, setTokensList] = useState<types.RedeemedTokenItem[]>([]);

  const sortByCollectionName = (
    a: types.RedeemedTokenItem,
    b: types.RedeemedTokenItem,
  ) => {
    const nameA = a.collectionName.toUpperCase(); // ignore upper and lowercase
    const nameB = b.collectionName.toUpperCase(); // ignore upper and lowercase
    if (nameA > nameB) {
      return 1;
    }
    if (nameA < nameB) {
      return -1;
    }

    // names must be equal
    return 0;
  };

  const loadRedeemedTokens = async (walletAddress: string) => {
    try {
      setLoadingData(true);

      const apiResponse = await getTokensOwnedTokens(walletAddress);

      const completeData = apiResponse.data.reduce(
        (result: types.RedeemedTokenItem[], item: any) => {
          const allTokens: types.RedeemedTokenItem[] = item.ownedTokens;
          allTokens.sort(sortByCollectionName);
          result.push(...allTokens);
          return result;
        },
        [],
      );

      console.log('completeData', completeData);

      setTokensList(completeData);
      setLoadingData(false);
    } catch (err: any) {
      setLoadingData(false);
      console.log('Unable to retrieve data', err?.message || '');
    }
  };

  useEffect(() => {
    if (userWallet !== '') {
      loadRedeemedTokens(userWallet);
    }

    return () => {
      clearTimeout(timer.current);
    };
  }, [userWallet]);

  const getNetworkIcon = (networkId: number) => {
    if (networkId === 5) {
      return <EthereumIcon style={{ ...styles.networkIcon }} />;
    } else if (networkId == 80001) {
      return <PolygonIcon style={{ ...styles.networkIcon }} />;
    }
    return <></>;
  };

  return (
    <Box component="div" sx={{ py: 2, px: 4 }}>
      <Typography variant="h4"> My NFTs </Typography>

      <WalletBox walletAddress={userWallet} />

      <Loader loading={loadingData} sx={styles.loader} size={50} />

      {!loadingData && tokensList.length > 0 && (
        <>
          <Typography sx={{ mt: 2, mb: 4 }}>
            If you used different wallets to redeem NFTs, use metamask to toggle between
            accounts.
          </Typography>

          <Grid container>
            <Grid item xs={12}>
              <ImageList
                gap={36}
                sx={{
                  mb: 8,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))!important',
                  overflowY: 'auto',
                }}
              >
                {tokensList.map((item, index) => (
                  <Card key={index} elevation={0} sx={{ border: '1px solid #968572' }}>
                    <ImageListItem>
                      <img
                        src={`${BASE_METADATA_URI}${item.imageUrl}?w=100%&fit=crop&auto=format`}
                        alt={item.tokeName}
                        loading="lazy"
                        style={{ padding: 16, alignSelf: 'center', maxWidth: 300 }}
                      />
                      <Stack direction="column" sx={{ px: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          {item?.collectionName && (
                            <Tooltip
                              title={
                                item.collectionName.length > 20 ? item.collectionName : ''
                              }
                              arrow
                              placement="top"
                            >
                              <Typography component="h6" sx={styles.collectionTitle}>
                                {formatLongName(item.collectionName)}
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>

                        <Box sx={{}}>
                          <Typography sx={styles.tokenName}>{item.tokeName}</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" sx={{ pl: 2, pr: 1, pt: 3, pb: 1 }}>
                        <Box sx={{ flexGrow: 1, pt: 1 }}>
                          {getNetworkIcon(item.chainId)}
                        </Box>
                        <Box>
                          <Tooltip title="view in OpenSea" arrow placement="right">
                            <IconButton
                              //disableRipple
                              onClick={() => {
                                //window.open(link, '_blank');
                              }}
                              //sx={{px: 0}}
                            >
                              <LaunchIcon color="info" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Stack>
                    </ImageListItem>
                  </Card>
                ))}
              </ImageList>
            </Grid>
          </Grid>
        </>
      )}

      {!loadingData && tokensList.length === 0 && (
        <>
          <SentimentVeryDissatisfiedIcon sx={{ mt: 5, mb: 1, fontSize: 50 }} />
          <Typography variant="h6">No NFTs for you at this moment</Typography>
        </>
      )}
    </Box>
  );
};

export default MyProfile;
