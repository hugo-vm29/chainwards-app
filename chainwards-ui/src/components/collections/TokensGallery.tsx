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
import TokenIcon from '@mui/icons-material/Token';
import RefreshIcon from '@mui/icons-material/Refresh';
import Loader from '../shared/Loader';
import NewTokenModal from './modals/NewTokenModal';
import { useMetamaskContext } from '../../contexts/MetamaskProvider';
import { BASE_METADATA_URI } from '../../utils/constants';
import * as types from '../../utils/types';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';

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
};

const TokensGallery: FunctionComponent<TokensGalleryProps> = ({ contractAddress }) => {
  const { getRpcSigner } = useMetamaskContext();

  const [openNewTokenModal, setOpenNewTokenModal] = useState(false);
  const [loadingListedTokens, setLoadingListedTokens] = useState(true);
  const [totalTokens, setTotalTokens] = useState(0);
  const [listedTokens, setListedTokens] = useState<types.TokenGalleryItem[]>([]);
  const [onChainError, setOnChainError] = useState(false);

  const processListedToken = async (
    contractInstance: Contract,
    tokenItem: types.ListedToken,
  ) => {
    try {
      const tokenId = Number(tokenItem.tokenId);
      const tokenURI = await contractInstance.uri(tokenId);
      //console.log("tokenURI", tokenURI);
      const getMeta = await axios.get(tokenURI);

      if (getMeta.status === 200) {
        const metadata = getMeta.data;

        const listedToken: types.TokenGalleryItem = {
          tokenId: tokenId,
          name: metadata.name,
          owners: Object.values(tokenItem.claimers),
          image: metadata.image.replace('ipfs://', ''),
          claimable: tokenItem.claimable,
        };

        return listedToken;
      }
    } catch (err: any) {
      console.error('Unable process token', err?.message || '');
      setOnChainError(true);
    }
  };

  const getListedTokens = useCallback(async (ctAddress: string) => {
    try {
      setLoadingListedTokens(true);

      const signer: any = await getRpcSigner();
      const contractInstance = new ethers.Contract(
        ctAddress,
        RewardsContract.abi,
        signer,
      );
      const txResponse = await contractInstance.getAllListedTokens();
      //console.log(" txResponse --> ", txResponse);

      if (Object.keys(txResponse).length === 0) {
        setTotalTokens(0);
        setLoadingListedTokens(false);
      } else {
        const promesas: any[] = [];

        txResponse.map((item: types.ListedToken) => {
          promesas.push(processListedToken(contractInstance, item));
        });

        const listedTokens = await Promise.all(promesas);
        //console.log("listedTokens --->" , listedTokens);
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
                  subtitle={`Owners: ${item.owners.length}`}
                  actionIcon={
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                      aria-label={`info about ${item.name}`}
                      //onClick={() => {}}
                    >
                      <InfoIcon />
                    </IconButton>
                  }
                ></ImageListItemBar>
              </ImageListItem>
            ))}
          </ImageList>

          <NewTokenModal
            openModal={openNewTokenModal}
            onClose={() => {
              setOpenNewTokenModal(false);
            }}
            contractAddress={contractAddress}
            onSubmitCallback={refreshListedTokens}
          />
        </>
      )}
    </Box>
  );
};

const propTypes = {
  contractAddress: PropTypes.string.isRequired,
};

type TokensGalleryProps = PropTypes.InferProps<typeof propTypes>;

TokensGallery.defaultProps = {};

export default TokensGallery;
