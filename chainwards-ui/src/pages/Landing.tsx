import { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import TokenIcon from '@mui/icons-material/Token';
import Loader from '../components/shared/Loader'
import CircularProgress from '@mui/material/CircularProgress';
import { useMetamaskContext } from '../contexts/MetamaskProvider';
import { findAccountByWallet } from '../utils/fetch';
import NewAccountModal from '../components/accounts/NewAccountModal'

const Landing = () => {

  const navigate = useNavigate();

  const { walletAddress, metamaskInstalled , updateStorageInfo, connectToMetamask , resetWalletInfo} = useMetamaskContext();
  
  const [checkingAdmin , setCheckingAdmin] = useState(false);
  const [openModalRegistration , setOpenModalRegistration] = useState(false);
  

  const handleAdminLogin = async () => {

    if(metamaskInstalled){
      if(walletAddress !== ""){
        await reviewIfAccountExist(walletAddress);
      }else{
        const connectedAddress: string = await connectToMetamask();
        if(connectedAddress !== ""){
          await reviewIfAccountExist(connectedAddress);
        }
      }
    }else{
      setOpenModalRegistration(true);
    }
  }

  const reviewIfAccountExist = async(address: string) => {
    try{
      setCheckingAdmin(true);
      const apiResponse = await findAccountByWallet(address);
      if(apiResponse.status == 200){
        updateStorageInfo(true);
        navigate("/home");
      }else{
        throw new Error("api error");
      }
    }catch(err){
      setOpenModalRegistration(true);
    }
  }

  const onCancelNewAccount = () => {
    setCheckingAdmin(false);
    setOpenModalRegistration(false);
  }

  const callbackNewAccount = () => {
    setCheckingAdmin(false);
    setOpenModalRegistration(false);
    resetWalletInfo();
    window.location.reload();
  }

  return (
    <Grid container>
      <Grid item xs={5} sx={{ pt: "10em", px: 5 }}>
        <Typography variant="h2" noWrap sx={{ mb: 2, fontWeight: 600}}> ChainWards </Typography>
          <Typography
            variant="h6"
            sx={{fontWeight: 400 , mb: 4}}
          >
            Create and manage NTFs collections quick and easy ! 
          </Typography>
          <Typography
            variant="h6"
            sx={{fontWeight: 100}}
          >
           With just a few clicks you can setup your collection and create as many NFTs as you want each one with an individualized list of claimers. The NFTs are completly customizable to represent whatever you want.
          </Typography>
      </Grid>
      <Grid item xs={7} sx={{ pt: "5em", px: 5 }}>
        <Container maxWidth="xs">
          <Card sx={{ minWidth: 275 , backgroundColor:"#fafafa"}} variant='outlined'>
            <CardContent sx={{minHeight: 400, color: "#818181"}}>
              <Box display="flex" alignItems="center" flexDirection="column" sx={{mt: 2}}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2}}>Almost there !</Typography>
                <Typography variant="body2">No account is needed to claim a token. An account is required to create collections only.</Typography>
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" sx={{mt: 8}}>
                { !checkingAdmin ?
                    <>
                      <Button
                        variant="contained"
                        endIcon={ <TokenIcon sx={{ fontSize: 50 }}/>}
                        size='large'
                        onClick={ () => {
                          navigate("/claim");
                        }}
                      > 
                        Claim my NFT
                      </Button>
                      <Link
                        component="button"
                        sx={{ mt: 1.5 }}
                        onClick={handleAdminLogin}
                      >
                        Continue as admin
                      </Link>
                    </>
                  :
                  <Box>
                    <CircularProgress size={51}/>
                  </Box>
                }
              
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Grid>
      <NewAccountModal 
        openModal={openModalRegistration} 
        onClose={onCancelNewAccount}
        onConfirmAccount={callbackNewAccount}
        isMetamaskInstalled={metamaskInstalled}
      />
    </Grid>
  );

}

export default Landing;