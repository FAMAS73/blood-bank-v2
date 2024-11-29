'use client';

import { ethers } from 'ethers';

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask to use this application');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    throw new Error('Failed to connect wallet: ' + error.message);
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBloodType = (bloodType) => {
  return bloodType.toUpperCase();
};

export const handleTransaction = async (transaction) => {
  try {
    const tx = await transaction;
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected by user');
    }
    throw new Error('Transaction failed: ' + error.message);
  }
};

export const listenToEvents = (contract, eventName, callback) => {
  if (!contract) return;

  contract.on(eventName, (...args) => {
    callback(...args);
  });

  return () => {
    contract.off(eventName);
  };
};

export const getGasPrice = async (provider) => {
  try {
    const gasPrice = await provider.getGasPrice();
    return ethers.formatUnits(gasPrice, 'gwei');
  } catch (error) {
    console.error('Error getting gas price:', error);
    return null;
  }
};

export const estimateGas = async (contract, method, args) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args);
    return gasEstimate.toString();
  } catch (error) {
    console.error('Error estimating gas:', error);
    return null;
  }
};

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
