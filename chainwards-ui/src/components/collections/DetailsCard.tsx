import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { FunctionComponent } from 'react';
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

const DetailsCard: FunctionComponent<DetailsCardProps> = ({
  collectionInfo,
  loadingPage,
}) => {
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
    const baseUri = getBlockExplorerURI(collectionInfo.chainId);
    const fullLink = `${baseUri}/tx/${transactionHash}`;
    return fullLink;
  };

  const getContractUrl = (contractAddr: string) => {
    const baseUri = getBlockExplorerURI(collectionInfo.chainId);
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
                {collectionInfo.collectionName +
                  (collectionInfo.collectionSymbol !== ''
                    ? ` (${collectionInfo.collectionSymbol})`
                    : '')}
              </Typography>
              <AdminActions collectionId={collectionInfo._id} />
            </Box>

            <Typography sx={{ mb: 4 }}>{collectionInfo.collectiondescription}</Typography>

            <CardItem
              label="Contract Address"
              data={formatAddress(collectionInfo.contractAddress)}
              link={getContractUrl(collectionInfo.contractAddress)}
              tooltipText="view on block explorer"
            />
            <CardItem
              label="Transaction:"
              data={formatTxHash(collectionInfo.transactionHash)}
              link={getTransactionUrl(collectionInfo.transactionHash)}
              tooltipText="view on block explorer"
            />
            <CardItem label="Owner" data={collectionInfo.contractOwner} />
            <CardItem label="Network" data={getNetworkName(collectionInfo.chainId)} />

            <CardItem
              label="Deployed on"
              data={formatDate(collectionInfo.createdOn).toString()}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

const propTypes = {
  collectionInfo: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    collectionName: PropTypes.string.isRequired,
    collectiondescription: PropTypes.string.isRequired,
    collectionSymbol: PropTypes.string.isRequired,
    contractAddress: PropTypes.string.isRequired,
    contractOwner: PropTypes.string.isRequired,
    chainId: PropTypes.number.isRequired,
    collectionStatus: PropTypes.string.isRequired,
    blockIssuers: PropTypes.bool.isRequired,
    transactionHash: PropTypes.string.isRequired,
    createdOn: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
  loadingPage: PropTypes.bool,
};

type DetailsCardProps = PropTypes.InferProps<typeof propTypes>;

DetailsCard.defaultProps = {
  loadingPage: false,
};

export default DetailsCard;
