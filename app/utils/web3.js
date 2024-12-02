'use client';

export const detectMetaMask = () => {
  if (typeof window === 'undefined') return false;
  
  const { ethereum } = window;
  if (!ethereum) return false;
  
  // Check if MetaMask is installed
  if (!ethereum.isMetaMask) return false;
  
  return true;
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
