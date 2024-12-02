'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BloodDonation from './artifacts/contracts/BloodDonation.sol/BloodDonation.json';
import { detectMetaMask } from './utils/web3';

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

// Hardhat's default chain ID is 31337 (0x7A69)
const EXPECTED_CHAIN_ID = '0x7A69';
const LOCAL_NETWORK = {
  chainId: EXPECTED_CHAIN_ID,
  chainName: 'Hardhat Local',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['http://127.0.0.1:8545']
};

export function Providers({ children }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check for MetaMask installation
      const hasMetaMask = detectMetaMask();
      setIsMetaMaskInstalled(hasMetaMask);

      if (hasMetaMask) {
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            setAccount(null);
            setContract(null);
          } else {
            setAccount(accounts[0]);
            initializeContract(accounts[0]);
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

        // Check if already connected
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            await initializeContract(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking accounts:', error);
        }
      }

      setIsInitialized(true);
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const initializeContract = async (userAccount) => {
    if (!userAccount) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        throw new Error('Contract address not found in environment variables');
      }

      const bloodDonation = new ethers.Contract(
        contractAddress,
        BloodDonation.abi,
        signer
      );

      // Verify contract exists
      const code = await provider.getCode(contractAddress);
      if (code === '0x') {
        throw new Error('Contract not found at the specified address');
      }

      setContract(bloodDonation);
      setNetworkError(null);
    } catch (error) {
      console.error('Error initializing contract:', error);
      setNetworkError(error.message);
      setContract(null);
    }
  };

  const switchNetwork = async () => {
    try {
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
            params: [LOCAL_NETWORK],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          setNetworkError('Please add and select the Hardhat Local network in MetaMask');
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      setNetworkError('Please switch to the Hardhat Local network in MetaMask');
      return false;
    }
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      // Check network first
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== EXPECTED_CHAIN_ID) {
        const switched = await switchNetwork();
        if (!switched) return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await initializeContract(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        setNetworkError('Please accept the connection request in MetaMask');
      } else {
        setNetworkError('Failed to connect wallet. Please try again.');
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setNetworkError(null);
  };

  // Don't render until initialization is complete
  if (!isInitialized) {
    return null;
  }

  return (
    <Web3Context.Provider value={{ 
      account, 
      contract,
      connectWallet,
      disconnectWallet,
      isMetaMaskInstalled,
      networkError
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
