import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { FunctionComponent } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { formatAddress, formatDate, formatTxHash } from '../../utils/helpers';
import CardItem from './CardItem';
import AdminActions from './AdminActions';

const styles = {
  cardRoot: {
    mt: 8,
    mx: 2,
    background: '#fafafa 0% 0% no-repeat padding-box',
    boxShadow: '0px 3px 6px #00000029',
  },
};

const DetailsCard: FunctionComponent<DetailsCardProps> = ({ collectionInfo }) => {
  const getNetworkName = (chainId: number) => {
    let name = '';
    if (chainId == 5) {
      name = 'Goerli';
    } else if (chainId == 80001) {
      name = 'Polygon Mumbai';
    }
    return name;
  };

  return (
    <Card variant="outlined" sx={styles.cardRoot}>
      <CardContent>
        <Box display="flex" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            {collectionInfo?.collection_name}
          </Typography>
          <AdminActions collectionId={collectionInfo._id} />
        </Box>

        <Typography sx={{ mb: 4 }}>{collectionInfo?.collection_description}</Typography>
        <CardItem
          label="Contract Address"
          data={formatAddress(collectionInfo.contract_address)}
          link="#"
          tooltipText="view on etherscan"
        />
        <CardItem
          label="Transaction:"
          data={formatTxHash(collectionInfo.transaction_hash)}
          link="#"
          tooltipText="view on etherscan"
        />
        <CardItem label="Owner" data={collectionInfo.deployed_by} />
        <CardItem label="Network" data={getNetworkName(collectionInfo.chainId)} />
        <CardItem
          label="Deployed on"
          data={formatDate(new Date(collectionInfo.created_on)).toString()}
        />
      </CardContent>
    </Card>
  );
};

const propTypes = {
  collectionInfo: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    collection_name: PropTypes.string.isRequired,
    collection_description: PropTypes.string.isRequired,
    contract_address: PropTypes.string.isRequired,
    transaction_status: PropTypes.string.isRequired,
    transaction_hash: PropTypes.string.isRequired,
    created_on: PropTypes.string.isRequired,
    deployed_by: PropTypes.string.isRequired,
    chainId: PropTypes.number.isRequired,
  }).isRequired,
};

type DetailsCardProps = PropTypes.InferProps<typeof propTypes>;

DetailsCard.defaultProps = {};

export default DetailsCard;
