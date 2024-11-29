'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import BloodDonation from './artifacts/contracts/BloodDonation.sol/BloodDonation.json';
import { Snackbar, Alert, Button, Link, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

const Web3Context = createContext();

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#d32f2f',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const EXPECTED_CHAIN_ID = '0x539'; // Chain ID for localhost:8545
const LOCAL_NETWORK_PARAMS = {
  chainId: '0x539',
  chainName: 'Localhost 8545',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['http://localhost:8545'],
};

export function Providers({ children }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  const checkMetaMask = () => {
    const isInstalled = typeof window !== 'undefined' && 
                       typeof window.ethereum !== 'undefined' &&
                       window.ethereum.isMetaMask;
    setIsMetaMaskInstalled(isInstalled);
    return isInstalled;
  };

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
    setShowInstallDialog(true);
  };

  const checkNetwork = async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isCorrect = chainId === EXPECTED_CHAIN_ID;
      setIsCorrectNetwork(isCorrect);
      return isCorrect;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  };

  const switchToLocalNetwork = async () => {
    if (!window.ethereum) return false;

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EXPECTED_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [LOCAL_NETWORK_PARAMS],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          setAlert({
            open: true,
            message: 'Failed to add local network. Please try again.',
            severity: 'error'
          });
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      setAlert({
        open: true,
        message: 'Failed to switch network. Please try again.',
        severity: 'error'
      });
      return false;
    }
  };

  const initializeContract = async (signer) => {
    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address not found');
      }

      // Create contract instance
      const bloodDonation = new ethers.Contract(
        contractAddress,
        BloodDonation.abi,
        signer
      );

      // Verify contract is deployed
      const code = await signer.provider.getCode(contractAddress);
      if (code === '0x') {
        throw new Error('Contract not deployed');
      }

      return bloodDonation;
    } catch (error) {
      console.error('Contract initialization error:', error);
      throw new Error('Failed to initialize contract. Please check your connection and try again.');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setProvider(null);
    setAlert({
      open: true,
      message: 'Wallet disconnected',
      severity: 'info'
    });
  };

  const connectWallet = async (forceNewAccount = false) => {
    if (!checkMetaMask()) {
      handleInstallMetaMask();
      return;
    }

    try {
      const isCorrect = await checkNetwork();
      if (!isCorrect) {
        const switched = await switchToLocalNetwork();
        if (!switched) return;
      }

      // Request account access
      const method = forceNewAccount ? 'wallet_requestPermissions' : 'eth_requestAccounts';
      const params = forceNewAccount ? [{ eth_accounts: {} }] : [];
      
      const accounts = forceNewAccount 
        ? (await window.ethereum.request({ method, params }))
            .find(p => p.parentCapability === 'eth_accounts')?.caveats[0]?.value
        : await window.ethereum.request({ method });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Initialize contract
      const contract = await initializeContract(signer);

      setAccount(accounts[0]);
      setContract(contract);
      setProvider(provider);
      setAlert({
        open: true,
        message: 'Wallet connected successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setAlert({
        open: true,
        message: error.message === 'User rejected the request.'
          ? 'Connection rejected. Please try again.'
          : `Failed to connect: ${error.message}`,
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      checkMetaMask();

      if (isMetaMaskInstalled) {
        // Check network
        await checkNetwork();

        // Check if already connected
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          console.error('Error checking accounts:', error);
        }

        // Setup event listeners
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            setAccount(null);
            setContract(null);
            setProvider(null);
            setAlert({
              open: true,
              message: 'Wallet disconnected',
              severity: 'info'
            });
          } else {
            connectWallet();
          }
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

        return () => {
          window.ethereum.removeAllListeners('accountsChanged');
          window.ethereum.removeAllListeners('chainChanged');
        };
      }
    };

    init();
  }, [isMetaMaskInstalled]);

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <Web3Context.Provider value={{ 
      account, 
      contract, 
      provider, 
      connectWallet,
      disconnectWallet,
      isMetaMaskInstalled,
      isCorrectNetwork,
      switchToLocalNetwork
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
        <Snackbar 
          open={alert.open} 
          autoHideDuration={6000} 
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseAlert} 
            severity={alert.severity}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>

        <Dialog 
          open={showInstallDialog} 
          onClose={() => setShowInstallDialog(false)}
        >
          <DialogTitle>Installing MetaMask</DialogTitle>
          <DialogContent>
            <Typography>
              MetaMask installation has started in a new tab. After installing:
              <ol>
                <li>Complete the MetaMask setup</li>
                <li>Refresh this page</li>
                <li>Click &quot;Connect Wallet&quot; to continue</li>
              </ol>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowInstallDialog(false)}>Close</Button>
            <Button 
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              variant="contained"
            >
              Install MetaMask
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
