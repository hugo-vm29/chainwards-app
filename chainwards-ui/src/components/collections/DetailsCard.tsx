import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {
  formatAddress,
  formatDate,
  formatTxHash,
  getBlockExplorerURI,
} from '../../utils/helpers';
import CardItem from './CardItem';
import AdminActions from './AdminActions';
import Loader from '../../components/shared/Loader';
import * as types from '../../utils/types';
import { useMetamaskContext } from '../../contexts/MetamaskProvider';

const styles = {
  cardRoot: {
    mt: 8,
    mx: 2,
    background: '#fafafa 0% 0% no-repeat padding-box',
    boxShadow: '0px 3px 6px #00000029',
    minHeight: '35em',
  },
  loader: {
    position: 'relative',
    display: 'block',
    backgroundColor: 'transparent',
  },
};

const DetailsCard = ({ collection, loadingPage }: DetailsCardProps) => {
  const { userWallet } = useMetamaskContext();

  const getNetworkName = (chainId: number) => {
    let name = '';
    if (chainId == 5) {
      name = 'Goerli';
    } else if (chainId == 80001) {
      name = 'Polygon Mumbai';
    }
    return name;
  };

  const getTransactionUrl = (transactionHash: string) => {
    const baseUri = getBlockExplorerURI(collection.chainId);
    const fullLink = `${baseUri}/tx/${transactionHash}`;
    return fullLink;
  };

  const getContractUrl = (contractAddr: string) => {
    const baseUri = getBlockExplorerURI(collection.chainId);
    const fullLink = `${baseUri}/address/${contractAddr}`;
    return fullLink;
  };

  return (
    <Card variant="outlined" sx={styles.cardRoot}>
      <CardContent>
        <Loader loading={loadingPage || false} sx={styles.loader} size={35} />
        {!loadingPage && (
          <>
            <Box display="flex" sx={{ pt: 2, mb: 4, alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                {collection.name +
                  (collection.symbol !== '' ? ` (${collection.symbol})` : '')}
              </Typography>

              {userWallet === collection.owner && (
                <AdminActions
                  collectionId={collection._id}
                  contractAddress={collection.contractAddress}
                />
              )}
            </Box>

            <Typography sx={{ mb: 4 }}>{collection.description}</Typography>

            <CardItem
              label="Contract Address"
              data={formatAddress(collection.contractAddress)}
              link={getContractUrl(collection.contractAddress)}
              tooltipText="view on block explorer"
            />
            <CardItem
              label="Transaction:"
              data={formatTxHash(collection.transactionInfo.transactionHash)}
              link={getTransactionUrl(collection.transactionInfo.transactionHash)}
              tooltipText="view on block explorer"
            />
            <CardItem label="Owner" data={collection.owner} />
            <CardItem label="Network" data={getNetworkName(collection.chainId)} />

            <CardItem
              label="Deployed on"
              data={formatDate(collection.createdOn).toString()}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

type DetailsCardProps = {
  loadingPage: boolean;
  collection: types.CollectionsRow;
};

DetailsCard.defaultProps = {
  loadingPage: false,
};

export default DetailsCard;
