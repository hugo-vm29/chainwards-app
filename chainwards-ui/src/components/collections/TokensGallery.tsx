import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Contract, ethers } from 'ethers';
import RewardsContract from '../../contracts/Rewards.json';
import Box from '@mui/material/Box';
import { FunctionComponent } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Tooltip from '@mui/material/Tooltip';
import TokenIcon from '@mui/icons-material/Token';
import RefreshIcon from '@mui/icons-material/Refresh';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import LaunchIcon from '@mui/icons-material/Launch';
import InfoIcon from '@mui/icons-material/Info';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { useMetamaskContext } from '../../contexts/MetamaskProvider';
import { BASE_METADATA_URI } from '../../utils/constants';
import { formatAddress, formatDate, getBlockExplorerURI } from '../../utils/helpers';
import { getTokenInCollection } from '../../utils/fetch';
import * as types from '../../utils/types';
import Loader from '../shared/Loader';
import NewTokenModal from './modals/NewTokenModal';
import ViewClaimersModal from './modals/ViewClaimersModal';
import ViewOwnersModal from './modals/ViewOwnersModal';

const styles = {
  rootContainer: {
    mt: 8,
    mx: 2,
  },
  loader: {
    mt: 4,
    position: 'relative',
    display: 'block',
    backgroundColor: 'transparent',
  },
  iconButtons: {
    textTransform: 'none',
    pl: 0,
    color: 'inherit',
    '&.MuiButton-text:hover': {
      background: 'none',
      color: '#696969',
    },
  },
};

const TokensGallery: FunctionComponent<TokensGalleryProps> = ({
  contractAddress,
  collectionId,
}) => {
  const { getRpcSigner } = useMetamaskContext();

  const [openNewTokenModal, setOpenNewTokenModal] = useState(false);
  const [loadingListedTokens, setLoadingListedTokens] = useState(true);
  const [totalTokens, setTotalTokens] = useState(0);
  const [listedTokens, setListedTokens] = useState<types.TokenGalleryItem[]>([]);
  const [onChainError, setOnChainError] = useState(false);
  const [selectedToken, setSelectedToken] = useState<types.TokenGalleryItem | null>(null);
  const [visiblePanel, setVisiblePanel] = useState(1);
  const [viewClaimersModal, setViewClaimersModal] = useState(false);
  const [viewOwnersModal, setViewOwnersModal] = useState(false);

  const processListedToken = async (
    contractInstance: Contract,
    tokenItem: types.ListedToken,
  ) => {
    try {
      const tokenId = Number(tokenItem.tokenId);
      const tokenURI = await contractInstance.uri(tokenId);

      const promisesResponses = await Promise.all([
        getTokenInCollection(collectionId, tokenId),
        axios.get(tokenURI),
      ]);

      const apiInfo = promisesResponses[0].data;
      const metaData = promisesResponses[1].data;
      const whitelist = apiInfo.whitelist.filter(
        (x: string) => x.toLowerCase() !== tokenItem.issuer.toLowerCase(),
      );

      const listedToken: types.TokenGalleryItem = {
        tokenId: tokenId,
        issuer: tokenItem.issuer,
        claimable: tokenItem.claimable,
        owners: Object.values(tokenItem.claimers),
        name: metaData.name,
        image: metaData.image.replace('ipfs://', ''),
        whitelist: whitelist,
        lastUpdated: formatDate(apiInfo.lastUpdated),
        chainId: apiInfo.chainId,
      };

      return listedToken;
    } catch (err: any) {
      console.error('Unable process token', err?.message || '');
      setOnChainError(true);
    }
  };

  const getListedTokens = useCallback(async (ctAddress: string) => {
    try {
      setLoadingListedTokens(true);

      const signer: any = await getRpcSigner();

      if (!signer) throw new Error('Unable to get signer account');

      const contractInstance = new ethers.Contract(
        ctAddress,
        RewardsContract.abi,
        signer,
      );
      const txResponse = await contractInstance.getAllListedTokens();

      if (Object.keys(txResponse).length === 0) {
        setTotalTokens(0);
        setLoadingListedTokens(false);
      } else {
        const promesas: any[] = [];

        txResponse.map((item: types.ListedToken) => {
          promesas.push(processListedToken(contractInstance, item));
        });

        const listedTokens = await Promise.all(promesas);
        //console.log('listedTokens --->', listedTokens);
        setTotalTokens(listedTokens.length);
        setListedTokens(listedTokens);
        setLoadingListedTokens(false);
      }
    } catch (err: any) {
      setOnChainError(true);
      console.error('Error (getListedTokens)', err?.message || '');
    }
  }, []);

  const refreshListedTokens = () => {
    getListedTokens(contractAddress);
  };

  const getBlockExplorerLink = (tokenId: number, chainId: number) => {
    const baseUri = getBlockExplorerURI(chainId);
    const fullLink = `${baseUri}/token/${contractAddress}?a=${tokenId}`;
    return fullLink;
  };

  const onChangeClaimers = (tokenId: number, newWhitelist: string[]) => {
    try {
      if (selectedToken !== null) {
        const filterWhitelist = newWhitelist.filter(
          (x: string) => x.toLowerCase() !== selectedToken.issuer.toLowerCase(),
        );
        setSelectedToken({ ...selectedToken, whitelist: filterWhitelist });
      }

      const findToken = listedTokens.find((i) => i.tokenId === tokenId);
      if (findToken !== undefined) {
        const filterWhitelist = newWhitelist.filter(
          (x: string) => x.toLowerCase() !== findToken?.issuer.toLowerCase(),
        );
        const updatedToken: types.TokenGalleryItem = {
          ...findToken,
          whitelist: filterWhitelist,
        };
        //console.log('updatedToken --> ', updatedToken);
        findToken.whitelist = newWhitelist;
        setListedTokens((prev) => [
          ...prev.filter((i) => i.tokenId !== tokenId),
          updatedToken,
        ]);
      }
    } catch (err: any) {
      console.error('Error ', err?.message || '');
    }
  };

  useEffect(() => {
    if (contractAddress !== '') {
      getListedTokens(contractAddress);
    }
  }, [getListedTokens]);

  return (
    <Box sx={styles.rootContainer}>
      <Box display="flex" alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          NFTs in this collection
        </Typography>
        <Button
          variant="contained"
          disabled={false}
          // sx={{ mr: 8  }}
          size="large"
          startIcon={<TokenIcon />}
          onClick={() => {
            setOpenNewTokenModal(true);
          }}
        >
          Add NFT
        </Button>
      </Box>
      <Loader loading={loadingListedTokens || false} sx={styles.loader} size={35} />

      {onChainError && (
        <Alert
          sx={{ mt: 3 }}
          severity="error"
          action={
            <IconButton
              aria-label="refresh"
              onClick={() => {
                setOnChainError(false);
                refreshListedTokens();
              }}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          <AlertTitle>An error have ocurred</AlertTitle>
          An error have ocurred while retrieving the data from the blockchain. Please
          refresh.
        </Alert>
      )}

      {!loadingListedTokens && !onChainError && (
        <>
          <Collapse in={visiblePanel == 1}>
            <Box display="flex" alignItems="center" sx={{ mt: 3 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Unique items:{' '}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: '500' }}>
                {totalTokens}
              </Typography>
            </Box>
            <ImageList sx={{ width: '100%' }} cols={4}>
              {listedTokens.map((item, index) => (
                <ImageListItem
                  key={index}
                  sx={{ mr: 2, mb: 2, border: '1px solid #eaeaea' }}
                >
                  <img
                    src={`${BASE_METADATA_URI}${item.image}?w=248&fit=crop&auto=format`}
                    srcSet={`${BASE_METADATA_URI}${item.image}?w=248&fit=crop&auto=format&dpr=2 2x`}
                    alt={item.name}
                    loading="lazy"
                  />
                  <ImageListItemBar
                    title={item.name}
                    //subtitle={`Owners: ${item.owners.length}`}
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        aria-label={`info about ${item.name}`}
                        onClick={() => {
                          setSelectedToken(item);
                          setVisiblePanel((prev) => (prev === 1 ? 2 : 1));
                        }}
                      >
                        <InfoIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Collapse>

          <Collapse in={visiblePanel === 2}>
            <Paper sx={{ mt: 3, p: 2, border: '1px solid #eaeaea' }} elevation={2}>
              {
                selectedToken && (
                  <Grid container>
                    <Grid item md={3}>
                      <img
                        src={`${BASE_METADATA_URI}${selectedToken.image}?w=100%&fit=crop&auto=format`}
                        //srcSet={`${BASE_METADATA_URI}${selectedToken.image}?w=100%&fit=crop&auto=format&dpr=2 2x`}
                        alt={selectedToken.name}
                        loading="lazy"
                        style={{ width: '100%' }}
                      />
                    </Grid>

                    <Grid item md={6}>
                      <Box display="flex" flexDirection="column" sx={{ px: 3 }}>
                        <Typography variant="h6" flexGrow="1" sx={{ mb: 2 }}>
                          {selectedToken.name}
                        </Typography>
                        <Box display="flex" flexDirection="row" sx={{ mb: 1 }}>
                          <Typography sx={{ fontWeight: 'bold', mr: 1 }}>
                            Token ID:{' '}
                          </Typography>
                          <Typography>{selectedToken.tokenId}</Typography>
                        </Box>
                        <Box display="flex" flexDirection="row" sx={{ mb: 1 }}>
                          <Typography sx={{ fontWeight: 'bold', mr: 1 }}>
                            Issued by:{' '}
                          </Typography>
                          <Tooltip title={selectedToken.issuer} arrow placement="right">
                            <Typography>{formatAddress(selectedToken.issuer)}</Typography>
                          </Tooltip>
                        </Box>
                        <Box display="flex" flexDirection="row" sx={{ mb: 1 }}>
                          <Typography sx={{ fontWeight: 'bold', mr: 1 }}>
                            Last updated:{' '}
                          </Typography>
                          <Typography>{selectedToken.lastUpdated.toString()}</Typography>
                        </Box>
                        <Box display="flex" flexDirection="row" sx={{ mt: 5 }}>
                          <Button
                            disableRipple
                            size="large"
                            sx={styles.iconButtons}
                            endIcon={<LaunchIcon />}
                          >
                            View on OpenSea
                          </Button>
                        </Box>
                        <Box display="flex" flexDirection="row" sx={{}}>
                          <Button
                            disableRipple
                            size="large"
                            onClick={() => {
                              const url = getBlockExplorerLink(
                                selectedToken.tokenId,
                                selectedToken.chainId,
                              );
                              window.open(url, '_blank');
                            }}
                            sx={styles.iconButtons}
                            endIcon={<LaunchIcon />}
                          >
                            View on block explorer
                          </Button>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item md={2}>
                      <Box display="flex" flexDirection="column">
                        <Box display="flex" flexDirection="row" sx={{ mb: 1 }}>
                          <Button
                            disableRipple
                            size="large"
                            sx={styles.iconButtons}
                            startIcon={<PeopleOutlineIcon />}
                            onClick={() => {
                              setViewOwnersModal(true);
                            }}
                          >
                            {`${selectedToken.owners.length} owners`}
                          </Button>
                        </Box>
                        <Box display="flex" flexDirection="row">
                          <Button
                            disableRipple
                            size="large"
                            sx={styles.iconButtons}
                            startIcon={<AssignmentIcon />}
                            onClick={() => {
                              setViewClaimersModal(true);
                            }}
                          >
                            {`${selectedToken.whitelist.length} whitelisted claimers`}
                          </Button>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item md={1}>
                      <IconButton
                        aria-label="close"
                        size="small"
                        sx={{ float: 'right' }}
                        onClick={() => {
                          setVisiblePanel((prev) => (prev === 1 ? 2 : 1));
                          setSelectedToken(null);
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                ) //main container
              }
            </Paper>
          </Collapse>
        </>
      )}

      <NewTokenModal
        openModal={openNewTokenModal}
        onClose={() => {
          setOpenNewTokenModal(false);
        }}
        contractAddress={contractAddress}
        onSubmitCallback={refreshListedTokens}
      />

      <ViewClaimersModal
        openModal={viewClaimersModal}
        onClose={() => {
          setViewClaimersModal(false);
        }}
        tokenInfo={{
          currentList: selectedToken ? selectedToken.whitelist : [],
          tokenIssuer: selectedToken ? selectedToken.issuer : '',
          tokenId: selectedToken ? selectedToken.tokenId : 0,
        }}
        contractAddress={contractAddress}
        collectionId={collectionId}
        submitCallback={onChangeClaimers}
      />

      <ViewOwnersModal
        openModal={viewOwnersModal}
        onClose={() => {
          setViewOwnersModal(false);
        }}
        ownersList={selectedToken?.owners || []}
      />
    </Box>
  );
};

const propTypes = {
  contractAddress: PropTypes.string.isRequired,
  collectionId: PropTypes.string.isRequired,
};

type TokensGalleryProps = PropTypes.InferProps<typeof propTypes>;

TokensGallery.defaultProps = {};

export default TokensGallery;
