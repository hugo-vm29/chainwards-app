import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import headerLogo from '/sample_logo.png';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRegisteredAccount } from '../../utils/hooks';

const PUBLIC_NAV_ITEMS = [
  {
    name: 'Claim NFT',
    url: '/claim',
  },
  {
    name: 'My NFTs',
    url: '/profile',
  },
];

const PageLayout: FunctionComponent<PageLayoutRouteProps> = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isAdminLoggedIn = useRegisteredAccount(true);
  const [navItems, setNavItems] = useState(PUBLIC_NAV_ITEMS);

  const handleClick = (url: string) => {
    navigate(url);
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      setNavItems([
        {
          name: 'Collections',
          url: '/collections',
        },
      ]);
    }
  }, [isAdminLoggedIn]);

  return (
    <Box component="main" sx={{ minHeight: '100vh' }}>
      <AppBar
        sx={{
          //height: '75px',
          // display: 'flex',
          // flexDirection: 'row',
          backgroundColor: '#fff',
          color: '#000',
          mb: 1,
        }}
        position="static"
        elevation={2}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ mr: 5 }}>
            <Link href="/">
              <img src={headerLogo} alt="logo" style={{ height: '3em' }} />
            </Link>
          </Box>

          <Box display="flex" sx={{ flexGrow: 1 }}>
            {pathname !== '/' &&
              navItems.map((item, index) => (
                <Button
                  key={index}
                  sx={{ mx: 2, display: 'block' }}
                  onClick={() => handleClick(item.url)}
                >
                  {item.name}
                </Button>
              ))}
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
