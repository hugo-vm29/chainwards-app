import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FunctionComponent } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import IssuersModal from './modals/IssuersModal';
import { getIssuersList } from '../../utils/fetch';

const styles = {
  cardRoot: {
    mt: 8,
    mx: 2,
    background: '#fafafa 0% 0% no-repeat padding-box',
    boxShadow: '0px 3px 6px #00000029',
  },
  icons: {
    fontSize: '1.125rem',
  },
};

/* eslint-disable @typescript-eslint/no-unused-vars, no-empty, @typescript-eslint/no-empty-function */

const AdminActions: FunctionComponent<AdminActionsProps> = ({ collectionId, contractAddress}) => {
  
  const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(null);
  const open = Boolean(anchorEl);

  const [openIssuersModal, setOpenIssuersModal] = useState(false);
  const [issuersList, setIssuersList] = useState<string[]>([]);

  //
  //const [submitIssuersChange, setSubmitIssuersChange] = useState(false);

  const handleMenuButton = (event: React.SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const getCurrentIssuersList = async(collectionId: string) => {

    try{
      const apiReq = await getIssuersList(collectionId);
      if(apiReq.status == 200){
        console.log("apiReq", apiReq.data);
        setIssuersList(apiReq.data.issuers);
      }
    }catch(err:any){
      console.error("Error loading data", err?.message || "");
    }
  }

  const onUpdateIssuers = async() => {
    handleCloseMenu();

  }

  // const handleManageIssuers = () => {
  //   handleCloseMenu();
  //   setOpenIssuersModal(true);
  // };

  // const onCloseIssuersModal = () => {
  //   setOpenIssuersModal(false);
  // };


  useEffect(() => {
    getCurrentIssuersList(collectionId);
  }, []);

  // const onSubmitChangeIssuers = async (newList: string[]) => {
  //   try {

      
  //   } catch (err) {
  //     console.log('ERROR', err);
  //   }
  // };

  return (
    <>
      <Button
        id="edit-button"
        aria-controls={open ? 'edit-button' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleMenuButton}
        sx={{ minWidth: 0, padding: 0, margin: 0 }}
      >
        <MoreVertIcon sx={{ color: '#000000', opacity: '65%' }} />
      </Button>
      <Menu
        id="edit-client-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'edit-client-menu',
        }}
      >
        <MenuItem 
          onClick={() => {
            setOpenIssuersModal(true);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <ModeEditOutlineOutlinedIcon sx={styles.icons} />
          </ListItemIcon>
          <ListItemText>Manage NFT issuers</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {

          }}
        >
          <ListItemIcon>
            <SettingsIcon sx={styles.icons} />
          </ListItemIcon>
          <ListItemText>Collection settings</ListItemText>
        </MenuItem>
      </Menu>
      <IssuersModal
        openModal={openIssuersModal}
        onClose={()=>{
          setOpenIssuersModal(false);
        }}
        currentIssuers={['0x0000', '0x01111']}
        collectionId={collectionId}
        contractAddress={contractAddress}
      />
    </>
  );
};

const propTypes = {
  collectionId: PropTypes.string.isRequired,
  contractAddress: PropTypes.string.isRequired
};

type AdminActionsProps = PropTypes.InferProps<typeof propTypes>;

AdminActions.defaultProps = {};

export default AdminActions;
