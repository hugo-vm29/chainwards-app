import Box from '@mui/material/Box';
import { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import headerLogo from '/header_logo.png';
import Button from '@mui/material/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRegisteredAccount } from '../../utils/hooks';
import { useTheme } from '@mui/material/styles';
import { clearApplicationSession } from '../../utils/auth';

const NAV_ITEMS = [
  {
    name: 'Collections',
    url: '/collections',
    permission: 'ADMIN',
  },
  {
    name: 'Claim NFT',
    url: '/claim',
    permission: 'PUBLIC',
  },
  {
    name: 'My NFTs',
    url: '/profile',
    permission: 'PUBLIC',
  },
];

const useStyles = () => {
  return {
    navItem: (isSelected: boolean) => {
      return {
        mr: 3,
        px: 2,
        py: 0,
        display: 'block',
        //background: isSelected ? `${ _theme.palette.secondary.light} 0% 0% no-repeat padding-box` : 'none',
        color: '#fff',
        borderRadius: 0,
        borderBottom: isSelected ? `1px solid #fff` : '',
        '&:hover': {
          borderBottom: isSelected ? 'none' : '1px solid #fff',
          // background: isSelected ? '#6c121d 0% 0% no-repeat padding-box' : "none",
          //color: isSelected ? "#fff" : '#aa1226'
        },
      };
    },
  };
};

const PageLayout: FunctionComponent<PageLayoutRouteProps> = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const theme = useTheme();
  const classes = useStyles();
  const isAdminLoggedIn = useRegisteredAccount(true);

  const findSelected = () => {
    if (pathname.includes('/collections')) {
      return 0;
    }
    if (pathname.includes('/claim')) {
      return 1;
    }
    if (pathname.includes('/profile')) {
      return 2;
    }
    return -1;
  };

  const handleClick = (url: string) => {
    navigate(url);
  };

  const reviewPermission = (_permission: string) => {
    if (pathname === '/') return false;
    else if (_permission === 'PUBLIC' && !isAdminLoggedIn) return true;
    else if (_permission === 'ADMIN' && isAdminLoggedIn) return true;
    else return false;
  };

  return (
    <Box component="main" sx={{ minHeight: '100vh' }}>
      <AppBar
        sx={{
          backgroundColor: theme.palette.primary.light,
          //backgroundColor: 'transparent',
          color: '#000',
          mb: 1,
          borderBottom: `2px solid ${theme.palette.secondary.main}`,
        }}
        position="static"
        elevation={2}
      >
        <Toolbar sx={{ py: 1 }}>
          <Button
            sx={{ padding: 0, mr: 5 }}
            onClick={() => {
              clearApplicationSession();
              window.location.href = '/';
            }}
          >
            <img src={headerLogo} alt="logo" style={{ height: '3.5em' }} />
          </Button>

          <Box display="flex" sx={{ flexGrow: 1 }}>
            {NAV_ITEMS.map((item, index) => {
              if (reviewPermission(item.permission)) {
                return (
                  <Button
                    key={index}
                    sx={classes.navItem(index === findSelected())}
                    onClick={() => handleClick(item.url)}
                  >
                    {item.name}
                  </Button>
                );
              }
            })}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main">{children}</Box>
    </Box>
  );
};

const propTypes = {
  children: PropTypes.node.isRequired,
};

type PageLayoutRouteProps = PropTypes.InferProps<typeof propTypes>;
PageLayout.propTypes = propTypes;
PageLayout.defaultProps = {};

export default PageLayout;
