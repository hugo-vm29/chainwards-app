import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { FunctionComponent } from 'react';

const styles = {
  root: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: '11000',
    top: '0',
    left: '0',
    background: '#ffffffd1',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
};

const Loader: FunctionComponent<LoaderProps> = ({ loading, sx, size, ...props }) => {
  return loading ? (
    <Box
      sx={[
        styles.root,
        { display: loading ? 'flex' : 'none' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <CircularProgress size={size || 51} {...props} />
    </Box>
  ) : (
    <></>
  );
};

const propTypes = {
  loading: PropTypes.bool.isRequired,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
    ),
    PropTypes.func,
    PropTypes.object,
  ]),
  size: PropTypes.number,
};

type LoaderProps = PropTypes.InferProps<typeof propTypes>;
Loader.propTypes = propTypes;
Loader.defaultProps = {
  sx: {},
  size: 51,
};

export default Loader;
