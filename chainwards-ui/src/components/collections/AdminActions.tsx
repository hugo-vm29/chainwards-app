import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
import { FunctionComponent } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import LaunchIcon from '@mui/icons-material/Launch';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import IssuersList from './IssuersList';
import { getIssuersList, changeCollectionIssuers } from '../../utils/fetch';
import RewardsContract from '../../contracts/Rewards.json';
import { ReqBodyIssuers } from '../../utils/types';

const styles = {
  cardRoot: {
    mt: 8,
    mx: 2,
    background: '#fafafa 0% 0% no-repeat padding-box',
    boxShadow: '0px 3px 6px #00000029',
  },
  icons: {
    fontSize: '1.125rem',
    //margin: theme.spacing(0, 1.59375, 0, 0),
  },
};

const AdminActions: FunctionComponent<AdminActionsProps> = ({ collectionId }) => {
  const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(null);
  const open = Boolean(anchorEl);

  const [openIssuersModal, setOpenIssuersModal] = useState(false);

  const [issuersList, setIssuersList] = useState<string[]>([]);
  const [submitIssuersChange, setSubmitIssuersChange] = useState(false);

  const handleMenuButton = (event: React.SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleManageIssuers = () => {
    handleCloseMenu();
    setOpenIssuersModal(true);
  };

  const onCloseIssuersModal = () => {
    setOpenIssuersModal(false);
  };

  const getCurrentIssuersList = useCallback(
    async (id: string) => {
      try {
        if (collectionId) {
          const response = await getIssuersList(id);
          if (response.status === 200) {
            //console.log("response", response.data);
            setIssuersList(response.data.issuers);
          }
        }
      } catch (err) {
        console.error('Error loading data', 'error');
      }
    },
    [collectionId],
  );

  useEffect(() => {
    getCurrentIssuersList(collectionId);
  }, [collectionId]);

  const onSubmitChangeIssuers = async (newList: string[]) => {
    console.log('on submit ', newList);

    try {
      // setSubmitIssuersChange(true);
      // // const provider = new ethers.BrowserProvider(window.ethereum);
      // // const signer = await provider.getSigner();
      // // const contractInstance = new ethers.Contract("",RewardsContract.abi, signer);
      // // let transaction = await contractInstance.addTokenIssuersBatch(newList);
      // // await transaction.wait();
      // const body: ReqBodyIssuers = {
      //   collection_id: collectionId,
      //   new_list: newList
      // }
      // const apiResponse = await changeCollectionIssuers(body);
      // console.log("api response : ", apiResponse.data);
      // setIssuersList(newList);
      // setOpenIssuersModal(false);
      // setSubmitIssuersChange(false);
    } catch (err) {
      console.log('ERROR', err);
    }
  };

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
        <MenuItem onClick={handleManageIssuers}>
          <ListItemIcon>
            <ModeEditOutlineOutlinedIcon sx={styles.icons} />
          </ListItemIcon>
          <ListItemText>Manage NFT issuers</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <AcUnitIcon sx={styles.icons} />
          </ListItemIcon>
          <ListItemText>Collection settings</ListItemText>
        </MenuItem>
        {/* <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <PauseCircleOutlineIcon sx={styles.icons} />
          </ListItemIcon>
          <ListItemText>Disable minting</ListItemText>
        </MenuItem>  */}
      </Menu>
      <IssuersList
        openModal={openIssuersModal}
        onClose={onCloseIssuersModal}
        issuersList={issuersList}
        onSubmitData={onSubmitChangeIssuers}
      />
    </>
  );
};

const propTypes = {
  collectionId: PropTypes.string.isRequired,
};

type AdminActionsProps = PropTypes.InferProps<typeof propTypes>;

AdminActions.defaultProps = {};

export default AdminActions;
