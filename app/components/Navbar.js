'use client';

import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Stack,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { AccountBalanceWallet, Warning } from '@mui/icons-material';
import Link from 'next/link';
import { useWeb3 } from '../providers';
import { formatAddress } from '../utils/web3';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { account, connectWallet, disconnectWallet, isMetaMaskInstalled, networkError } = useWeb3();
  const [showError, setShowError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletClick = async () => {
    if (!isMetaMaskInstalled) {
      window.open('https://metamask.io/download/', '_blank');
      setShowError(true);
      return;
    }
    if (account) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  const getButtonContent = () => {
    // Don't show anything until mounted to avoid hydration mismatch
    if (!mounted) {
      return {
        text: "",
        icon: <CircularProgress size={20} color="inherit" />,
        tooltip: "Loading..."
      };
    }

    if (!isMetaMaskInstalled) {
      return {
        text: "Connect Wallet",
        icon: <Warning />,
        tooltip: "Install MetaMask to use this application"
      };
    }

    if (account) {
      return {
        text: formatAddress(account),
        icon: <AccountBalanceWallet />,
        tooltip: "Connected - Click to disconnect"
      };
    }

    return {
      text: "Connect Wallet",
      icon: <AccountBalanceWallet />,
      tooltip: "Connect your MetaMask wallet"
    };
  };

  const buttonContent = getButtonContent();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
              Blood Bank
            </Link>
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Link href="/donate" passHref>
              <Button 
                color="inherit"
                disabled={!account}
              >
                DONATE
              </Button>
            </Link>
            <Link href="/request" passHref>
              <Button 
                color="inherit"
                disabled={!account}
              >
                REQUEST
              </Button>
            </Link>
            
            <Tooltip title={buttonContent.tooltip}>
              <Button
                color="inherit"
                variant={account ? "outlined" : "contained"}
                startIcon={buttonContent.icon}
                onClick={handleWalletClick}
                sx={{ 
                  bgcolor: account ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    bgcolor: account ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'
                  },
                  minWidth: '180px',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {buttonContent.text}
              </Button>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity="warning"
          sx={{ width: '100%' }}
        >
          Please install MetaMask to use this application
        </Alert>
      </Snackbar>

      {networkError && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed', 
            top: 70, 
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            maxWidth: '90%',
            width: '600px'
          }}
          onClose={() => setNetworkError(null)}
        >
          {networkError}
        </Alert>
      )}
    </>
  );
}
