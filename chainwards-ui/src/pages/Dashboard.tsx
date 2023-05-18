import { useState } from 'react';
import viteLogo from '/vite.svg';
import reactLogo from '/react.svg';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useMetamaskContext } from '../contexts/MetamaskProvider';
import { useUserContext } from '../contexts/UserInfoProvider';


const Dashboard = () => {

  return (
    <Box component="div" sx={{p: 2}}>
      <Typography variant="h3"> Admin Dashboard </Typography>
    </Box>
  );

}

export default Dashboard;