import { useEffect , useState } from 'react';
import Box from '@mui/material/Box';
import { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import viteLogo from '/vite.svg';
import Button from '@mui/material/Button';
import { useNavigate , useLocation } from 'react-router-dom';
import { useAdminAccount } from '../../utils/hooks';


const styles = {
  appLogo: {
    display: "flex",
    alignItems: "center",
    background: "hsla(0,0%,100%,.08)",
    paddingLeft: "1rem",
    paddingRight: "2rem",
    justifyContent: "space-between"
  }
};

let PUBLIC_NAV_ITEMS = [
  { 
    name: "Claim My Reward",
    url: "/claim"
  },
  { 
    name: "My Profile",
    url: "/profile"
  },
];

const PageLayout: FunctionComponent<PageLayoutRouteProps>  = ({ children }) => {

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isAdminLoggedIn = useAdminAccount();
  const [navItems, setNavItems] = useState(PUBLIC_NAV_ITEMS);

  const handleClick = (url: string) => {
    navigate(url);
  };

  useEffect(() => {
    if(isAdminLoggedIn){
      setNavItems([
        {
          name: "Dashboard",
          url: "/home"
        },
        {
          name: "Collections",
          url: "/issue"
        }
      ]);
    }
  }, [isAdminLoggedIn]);
  
  return (
    <Box  component="main" sx={{ minHeight: '100vh'}} >
      <AppBar
        sx={{
            height: "75px",
            display: "flex",
            flexDirection: "row",
            backgroundColor: "#fff",
            mb: 1
          }}
          position="static"
          elevation={2}
        >
        <Toolbar disableGutters>
          <Box sx={{m: 2}} >
            <img src={viteLogo} alt="Vite logo" style={{ height: '3em' }} />
          </Box>
          {pathname !== "/" &&
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              { navItems.map((item, index) => (
                <Button
                  key={index}
                  sx={{ mx: 2, display: 'block' }}
                  onClick={() => handleClick(item.url)}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          }
        </Toolbar>
      </AppBar>
      <Box component="main" >
        {children}
      </Box>
   </Box>
  );
};



const propTypes = {
  children: PropTypes.node.isRequired,
};

type PageLayoutRouteProps = PropTypes.InferProps<typeof propTypes>;
PageLayout.propTypes = propTypes
PageLayout.defaultProps = {};

export default PageLayout;
