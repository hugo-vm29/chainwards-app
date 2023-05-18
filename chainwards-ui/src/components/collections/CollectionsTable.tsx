import { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import MUIDataTable , { MUIDataTableOptions } from 'mui-datatables';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Loader from '../shared/Loader'
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Link from '@mui/material/Link';

import { formatAddress, formatDate } from '../../utils/helpers'

const styles = {

  statusIcon: (status: string) => [
    status === 'failed' && { color: '#E60000 !important' },
    status === 'ready' && { color: '#0E8A00 !important' },
    status === 'pending' && { color: '#D68100 !important' }
  ],

  statusColor: (status: string) => [
    status === 'failed' && 
    { 
      backgroundColor: '#e6000061',
      border: "1px solid #E60000"
    },
    status === 'ready' &&
    {
      backgroundColor: '#0e8a002e',
      border: "1px solid #0E8A00"
    },
    status === 'pending' && 
    { 
      backgroundColor: '#d6810042',
      border: "1px solid #D68100",
      '&.MuiChip-root:hover': {
        backgroundColor: `#d6810078`,
      },
    }
  ],
  
}


const CollectionsTable: FunctionComponent<CollectionsTableProps> = ({loading, emptyMessage, handlePending, data}) => {

  const navigate = useNavigate();
  
  const getStatusIcon = (statusFlag :string) => {
    switch (statusFlag) {
      case 'ready':
        return <CheckCircleIcon sx={styles.statusIcon(statusFlag)} />;
      case 'failed':
        return <DoNotDisturbOnIcon sx={styles.statusIcon(statusFlag)} />;
      case 'pending':
        return <WatchLaterIcon sx={styles.statusIcon(statusFlag)} />;
      default:
        return <AutorenewIcon  sx={styles.statusIcon(statusFlag)} />;
    }
  };
  
  const columns = [
    {
      name: 'collection_name',
      label: 'Collection Name',
      options: {
        filter: false,
        customBodyRender: (value: string,  tableMeta: any) => {
          const status: string =  tableMeta.rowData[3];
          const id: string =  tableMeta.rowData[5];
          return (
           <>
            { status === "pending" ? 
               <Typography>{value}</Typography>
              :
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  navigate(`/collection/${id}/details`);
                }}
              >
              {value}
              </Link>
            }
           </>
          );
        },
      }
    },
    {
      name: 'contract_address',
      label: 'Contract Address',
      options: {
        filter: false,
        customBodyRender: (value: string) => {
          const formattedAddress = formatAddress(value);
          return (
            <Typography>
              {formattedAddress}
            </Typography>
          );
        },
      }
    },
    {
      name: 'created_on',
      label: 'Created On',
      options: {
        filter: false,
        customBodyRender: (value: Date) => {
          const formattedDate = formatDate(value);
          return (
            <Typography>
              {formattedDate.toString()}
            </Typography>
          );
        },
      }
    },
    {
      name: 'transaction_status',
      label: 'Transaction Status',
      options: {
        filter: false,
        customBodyRender: (value: string , tableMeta: any) => {
          const txHash = tableMeta.rowData[6];
          return (
            <Tooltip title={value == "pending" ? "click to refresh" : ""} arrow placement='right'>
              <Chip 
                label={value} 
                avatar={getStatusIcon(value)}
                sx={styles.statusColor(value)}
                {...( value == "pending" && { onClick: () => {handlePending(txHash)} })}
              />
          </Tooltip>
          );
        },
      }
    },
    {
      name: '# of tokens',
      label: '',
      options: {
        filter: false,
        customBodyRender: () => {
          return (
            <Typography>
              0
            </Typography>
          );
        },
      }
    },
    {
      name: '_id',
      options: {
        filter: false,
        display: false,
      },
    },
    {
      name: 'transaction_hash',
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
    selectableRows: "none",
    textLabels: {
      body: {
        noMatch: !loading ? emptyMessage : '',
      }
    },
  }
  
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

}

const propTypes = {
  emptyMessage: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
  handlePending: PropTypes.func.isRequired
};

type CollectionsTableProps = PropTypes.InferProps<typeof propTypes>;

CollectionsTable.propTypes = propTypes

CollectionsTable.defaultProps = {
  loading: false,
  emptyMessage: 'no collections found',
  handlePending: () => {}
};

export default CollectionsTable;
