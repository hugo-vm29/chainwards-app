import { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import MUIDataTable, { MUIDataTableOptions } from 'mui-datatables';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Loader from '../shared/Loader';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Link from '@mui/material/Link';
import { formatAddress, formatDate, getNetworkName } from '../../utils/helpers';
import PolygonIcon from '../../assets/PolygonIcon';
import EthereumIcon from '../../assets/EthereumIcon';

/* eslint-disable jsx-a11y/anchor-is-valid, @typescript-eslint/no-empty-function */

const styles = {
  statusIcon: (status: string) => [
    status === 'failed' && { color: '#E60000 !important' },
    status === 'completed' && { color: '#0E8A00 !important' },
    status === 'pending' && { color: '#D68100 !important' },
  ],
  statusColor: (status: string) => [
    status === 'failed' && {
      backgroundColor: '#e6000061',
      border: '1px solid #E60000',
    },
    status === 'completed' && {
      backgroundColor: '#0e8a002e',
      border: '1px solid #0E8A00',
    },
    status === 'pending' && {
      backgroundColor: '#d6810042',
      border: '1px solid #D68100',
      '&.MuiChip-root:hover': {
        backgroundColor: `#d6810078`,
      },
    },
  ],
  contactAddress: (status: string) => [
    status === 'completed' && {
      fontSize: 'normal',
      fontStyle: 'normal',
    },
    status === 'pending' && {
      fontSize: 'small',
      fontStyle: 'italic',
    },
  ],
  networkIcon: {
    height: '1.5rem',
    width: '1.5rem',
  },
};

const CollectionsTable: FunctionComponent<CollectionsTableProps> = ({
  loading,
  emptyMessage,
  handlePending,
  data,
}) => {
  const navigate = useNavigate();

  const getStatusIcon = (statusFlag: string) => {
    switch (statusFlag) {
      case 'completed':
        return <CheckCircleIcon sx={styles.statusIcon(statusFlag)} />;
      case 'failed':
        return <DoNotDisturbOnIcon sx={styles.statusIcon(statusFlag)} />;
      case 'pending':
        return <WatchLaterIcon sx={styles.statusIcon(statusFlag)} />;
      default:
        return <AutorenewIcon sx={styles.statusIcon(statusFlag)} />;
    }
  };

  const getNetworkIcon = (networkId: number) => {
    if (networkId === 5) {
      return <EthereumIcon {...styles.networkIcon} />;
    } else if (networkId == 80001) {
      return <PolygonIcon {...styles.networkIcon} />;
    }
    return <></>;
  };

  const columns = [
    {
      name: 'collectionName',
      label: 'Collection Name',
      options: {
        customBodyRender: (value: string, tableMeta: any) => {
          const status: string = tableMeta.rowData[4];
          const collectionId: string = tableMeta.rowData[6];
          return (
            <>
              {status === 'pending' ? (
                <Typography>{value}</Typography>
              ) : (
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => {
                    navigate(`/collection/${collectionId}/details`);
                  }}
                >
                  {value}
                </Link>
              )}
            </>
          );
        },
      },
    },
    {
      name: 'collectionSymbol',
      label: 'Symbol',
      options: {
        customBodyRender: (value: string) => {
          return <Typography>{value}</Typography>;
        },
      },
    },
    {
      name: 'contractAddress',
      label: 'Contract Address',
      options: {
        customBodyRender: (value: string, tableMeta: any) => {
          const status: string = tableMeta.rowData[4];
          const formattedAddress = formatAddress(value);
          return (
            <Typography sx={styles.contactAddress(status)}>
              {status === 'pending' ? 'deploying...' : formattedAddress}
            </Typography>
          );
        },
      },
    },
    {
      name: 'chainId',
      label: 'Network',
      options: {
        filter: false,
        customBodyRender: (value: Date) => {
          return (
            <Box display="flex" textAlign="center">
              {getNetworkIcon(Number(value))}
              <Typography sx={{ marginLeft: 1 }}>
                {getNetworkName(Number(value))}{' '}
              </Typography>
            </Box>
          );
        },
      },
    },
    {
      name: 'createdOn',
      label: 'Deployed On',
      options: {
        filter: false,
        customBodyRender: (value: Date) => {
          const formmatedDate = formatDate(value);
          return <Typography> {formmatedDate.toString()}</Typography>;
        },
      },
    },
    {
      name: 'transactionStatus',
      label: 'Deploy status',
      options: {
        filter: false,
        customBodyRender: (value: string, tableMeta: any) => {
          const transactionId = tableMeta.rowData[7];
          return (
            <Tooltip
              title={value == 'pending' ? 'click to refresh' : ''}
              arrow
              placement="right"
            >
              <Chip
                label={value}
                avatar={getStatusIcon(value)}
                sx={styles.statusColor(value)}
                {...(value == 'pending' && {
                  onClick: () => {
                    handlePending(transactionId);
                  },
                })}
              />
            </Tooltip>
          );
        },
      },
    },
    {
      name: 'collectionId',
      options: {
        filter: false,
        display: false,
      },
    },
    {
      name: '_id',
      options: {
        filter: false,
        display: false,
      },
    },
  ];

  const defaultTableOptions: MUIDataTableOptions = {
    elevation: 0,
    download: false,
    print: false,
    pagination: true,
    viewColumns: false,
    filter: false,
    sort: false,
    rowsPerPage: 10,
    selectableRowsHeader: false,
    search: false,
    searchOpen: false,
    selectableRows: 'none',
    textLabels: {
      body: {
        noMatch: !loading ? emptyMessage : '',
      },
    },
  };

  return (
    <Box position="relative">
      <Loader loading={loading} />
      <MUIDataTable
        title=""
        data={data}
        columns={columns}
        options={defaultTableOptions}
      />
    </Box>
  );
};

const propTypes = {
  emptyMessage: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
  handlePending: PropTypes.func.isRequired,
};

type CollectionsTableProps = PropTypes.InferProps<typeof propTypes>;

CollectionsTable.propTypes = propTypes;

CollectionsTable.defaultProps = {
  loading: false,
  emptyMessage: 'no collections found',
  handlePending: () => {},
};

export default CollectionsTable;
