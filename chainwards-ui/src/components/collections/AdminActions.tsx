import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FunctionComponent } from 'react';
import { ethers } from 'ethers';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import IssuersModal from './modals/IssuersModal';
import { getIssuersList, updateCollectionIssuers } from '../../utils/fetch';
import { useMetamaskContext } from '../../contexts/MetamaskProvider';
import * as types from '../../utils/types';
import RewardsContract from '../../contracts/Rewards.json';

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

//eslint-disable @typescript-eslint/no-unused-vars, no-empty, @typescript-eslint/no-empty-function

const AdminActions: FunctionComponent<AdminActionsProps> = ({
  collectionId,
  contractAddress,
}) => {
  const { getRpcSigner } = useMetamaskContext();

  const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(null);
  const open = Boolean(anchorEl);

  const [openIssuersModal, setOpenIssuersModal] = useState(false);
  const [issuersList, setIssuersList] = useState<string[]>([]);

  const handleMenuButton = (event: React.SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  /** MANAGE ISSUERS MODAL **/
  const getCurrentIssuersList = async (collectionId: string) => {
    try {
      const apiReq = await getIssuersList(collectionId);
      if (apiReq.status == 200) {
        setIssuersList(apiReq.data.issuers);
      }
    } catch (err: any) {
      console.error('Error loading data', err?.message || '');
    }
  };

  const handleSubmitIssuersChange = async (newList: string[]) => {
    try {
      const signer: any = await getRpcSigner();

      if (!signer) throw new Error('Unable to get signer account');

      const toRemove = issuersList.filter((x) => !newList.includes(x));

      const contractInstance = new ethers.Contract(
        contractAddress,
        RewardsContract.abi,
        signer,
      );

      /** chain roles in contract **/
      const onChainTxn = await contractInstance.updateTokenIssuersBatch(
        newList,
        toRemove,
      );
      await onChainTxn.wait();

      /** save changes in DB **/
      const reqBody: types.PatchIssuersReqBody = {
        collectionId: collectionId,
        newIssuers: newList,
        from: signer.address,
        txnHash: onChainTxn.hash,
      };

      const apiReponse = await updateCollectionIssuers(reqBody);

      if (apiReponse.status == 200) {
        setIssuersList(apiReponse.data.issuers);
        setOpenIssuersModal(false);
      }
    } catch (err: any) {
      console.error('Unable to submit changes. Please refresh.', err?.message || '');
      setOpenIssuersModal(false);
    }
  };

  useEffect(() => {
    getCurrentIssuersList(collectionId);
  }, []);

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
        <MenuItem>
          <ListItemIcon>
            <SettingsIcon sx={styles.icons} />
          </ListItemIcon>
          <ListItemText>Collection settings</ListItemText>
        </MenuItem>
      </Menu>
      <IssuersModal
        openModal={openIssuersModal}
        onClose={() => {
          setOpenIssuersModal(false);
        }}
        currentIssuers={issuersList}
        onSubmitData={handleSubmitIssuersChange}
      />
    </>
  );
};

const propTypes = {
  collectionId: PropTypes.string.isRequired,
  contractAddress: PropTypes.string.isRequired,
};

type AdminActionsProps = PropTypes.InferProps<typeof propTypes>;

AdminActions.defaultProps = {};

export default AdminActions;
