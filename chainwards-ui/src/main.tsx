import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router-dom';
import { MetamaskProvider } from './contexts/MetamaskProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <MetamaskProvider>
        <ThemeProvider theme={createTheme()}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </MetamaskProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
