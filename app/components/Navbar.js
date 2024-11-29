'use client';

import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
  useTheme,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Brightness4, 
  Brightness7, 
  AccountBalanceWallet,
  Warning,
  SwapHoriz
} from '@mui/icons-material';
import { useWeb3 } from '../providers';
import Link from 'next/link';
import { useState } from 'react';
import { formatAddress } from '../utils/blockchain';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [walletMenuAnchor, setWalletMenuAnchor] = useState(null);
  const { 
    account, 
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled,
    isCorrectNetwork,
    switchToLocalNetwork
  } = useWeb3();
  const theme = useTheme();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNetworkMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNetworkMenuClose = () => {
    setAnchorEl(null);
  };

  const handleWalletMenuOpen = (event) => {
    if (account) {
      setWalletMenuAnchor(event.currentTarget);
    } else {
      handleWalletClick();
    }
  };

  const handleWalletMenuClose = () => {
    setWalletMenuAnchor(null);
  };

  const handleSwitchNetwork = async () => {
    await switchToLocalNetwork();
    handleNetworkMenuClose();
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    handleWalletMenuClose();
  };

  const handleSwitchWallet = async () => {
    await connectWallet(true);
    handleWalletMenuClose();
  };

  const getWalletButtonContent = () => {
    if (!isMetaMaskInstalled) {
      return (
        <>
          <Warning sx={{ mr: 1 }} />
          Install MetaMask
        </>
      );
    }

    if (!isCorrectNetwork) {
      return (
        <>
          <SwapHoriz sx={{ mr: 1 }} />
          Switch Network
        </>
      );
    }

    if (account) {
      return formatAddress(account);
    }

    return (
      <>
        <AccountBalanceWallet sx={{ mr: 1 }} />
        Connect Wallet
      </>
    );
  };

  const getWalletButtonTooltip = () => {
    if (!isMetaMaskInstalled) {
      return 'MetaMask is required to use this application';
    }
    if (!isCorrectNetwork) {
      return 'Click to switch to Localhost:8545';
    }
    if (account) {
      return 'Connected Wallet';
    }
    return 'Connect your wallet';
  };

  const getWalletButtonColor = () => {
    if (!isMetaMaskInstalled) {
      return 'warning';
    }
    if (!isCorrectNetwork) {
      return 'warning';
    }
    return 'inherit';
  };

  const handleWalletClick = () => {
    if (!isCorrectNetwork) {
      switchToLocalNetwork();
    } else if (!account) {
      connectWallet();
    }
  };

  return (
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
              disabled={!account || !isCorrectNetwork}
            >
              DONATE
            </Button>
          </Link>
          <Link href="/request" passHref>
            <Button 
              color="inherit"
              disabled={!account || !isCorrectNetwork}
            >
              REQUEST
            </Button>
          </Link>
          
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <Tooltip title={getWalletButtonTooltip()}>
            <Button
              color={getWalletButtonColor()}
              onClick={handleWalletMenuOpen}
              variant={account ? "outlined" : "contained"}
              sx={{ 
                bgcolor: account ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: account ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              {getWalletButtonContent()}
            </Button>
          </Tooltip>

          <Menu
            anchorEl={walletMenuAnchor}
            open={Boolean(walletMenuAnchor)}
            onClose={handleWalletMenuClose}
          >
            <MenuItem onClick={handleSwitchWallet}>
              Switch Account
            </MenuItem>
            <MenuItem onClick={handleDisconnectWallet}>
              Disconnect
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
