import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import { FunctionComponent } from 'react';

/* eslint-disable @typescript-eslint/no-empty-function */

const Modal: FunctionComponent<ModalProps> = ({
  open,
  title,
  handleClose,
  actions,
  children,
  closeButton,
  ...props
}) => {
  let leftActions: any = [];
  let rightActions: any[] = [];

  if (actions) {
    leftActions = actions.filter((x) => x && x.position === 'left');
    rightActions = actions.filter((x) => x && x.position === 'right');
  }

  const fullScreen = useMediaQuery((customTheme: any) =>
    customTheme.breakpoints.down('md'),
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      fullWidth
      fullScreen={fullScreen}
      {...props}
    >
      <DialogTitle
        sx={{
          '&.MuiDialogTitle-root': {
            fontSize: '1.5rem',
          },
        }}
      >
        {title}
        {closeButton == true ? (
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      {actions && actions.length > 0 && (
        <DialogActions
          sx={{
            paddingX: 3,
            paddingBottom: 3,
            '&.MuiDialogActions-root': {
              '&>:not(:first-of-type)': {
                marginLeft: '16px',
              },
            },
          }}
        >
          {leftActions.map((item: any) => {
            const { name, ...btnProps } = item;
            return (
              <Tooltip title={item.tooltip ? item.tooltip : ''} key={name}>
                <span>
                  <Button sx={{}} {...btnProps}>
                    {name}
                  </Button>
                </span>
              </Tooltip>
            );
          })}
          {rightActions.length > 0 && (
            <Box
              component="div"
              sx={{
                display: 'flex',
                flex: '1 0 0',
              }}
            />
          )}
          {rightActions.map((item) => {
            const { name, ...btnProps } = item;
            return (
              <Button key={name} sx={{}} {...btnProps}>
                {name}
              </Button>
            );
          })}
        </DialogActions>
      )}
    </Dialog>
  );
};

const propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node.isRequired,
  handleClose: PropTypes.func.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
      position: PropTypes.oneOf(['left', 'right']),
      onClick: PropTypes.func,
      variant: PropTypes.string,
      size: PropTypes.string,
      disabled: PropTypes.bool,
    }),
  ),
  closeButton: PropTypes.bool,
};

type ModalProps = PropTypes.InferProps<typeof propTypes>;
Modal.propTypes = propTypes;

Modal.defaultProps = {
  open: false,
  title: 'Modal title',
  actions: [
    {
      name: 'Back',
      position: 'left',
      onClick: () => {},
      variant: 'outlined',
      color: 'primary',
    },
    {
      name: 'Next',
      position: 'right',
      onClick: () => {},
      variant: 'outlined',
      color: 'primary',
    },
  ],
  closeButton: false,
};

export default Modal;
