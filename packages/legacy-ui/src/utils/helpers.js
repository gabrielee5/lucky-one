import { ethers } from 'ethers';

export const formatEther = (value) => {
  if (!value) return '0';
  try {
    return ethers.formatEther(value);
  } catch (error) {
    console.error('Error formatting ether:', error);
    return '0';
  }
};

export const parseEther = (value) => {
  try {
    return ethers.parseEther(value.toString());
  } catch (error) {
    console.error('Error parsing ether:', error);
    return ethers.parseEther('0');
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimeRemaining = (endTime) => {
  const now = Math.floor(Date.now() / 1000);
  const remaining = endTime - now;
  
  if (remaining <= 0) return 'Ended';
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const calculateWinProbability = (userTickets, totalTickets) => {
  if (!userTickets || !totalTickets || totalTickets === 0) return 0;
  return ((userTickets / totalTickets) * 100).toFixed(2);
};

export const getLotteryStateText = (state) => {
  switch (state) {
    case 0:
      return 'Open';
    case 1:
      return 'Calculating Winner';
    case 2:
      return 'Closed';
    default:
      return 'Unknown';
  }
};

export const getLotteryStateColor = (state) => {
  switch (state) {
    case 0:
      return 'text-green-500';
    case 1:
      return 'text-yellow-500';
    case 2:
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const isValidNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value)) && parseFloat(value) > 0;
};

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getErrorMessage = (error) => {
  if (error?.reason) return error.reason;
  if (error?.message) {
    // Extract user-friendly message from error
    if (error.message.includes('user rejected transaction')) {
      return 'Transaction cancelled by user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('Incorrect payment amount')) {
      return 'Incorrect payment amount';
    }
    if (error.message.includes('Invalid ticket count')) {
      return 'Invalid ticket count';
    }
    if (error.message.includes('Lottery has ended')) {
      return 'Lottery has ended';
    }
    if (error.message.includes('Not the winner')) {
      return 'You are not the winner';
    }
    if (error.message.includes('Prize already claimed')) {
      return 'Prize already claimed';
    }
    return error.message;
  }
  return 'An unknown error occurred';
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

export const switchNetwork = async (chainId) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (error) {
    console.error('Failed to switch network:', error);
    return false;
  }
};

export const addNetwork = async (networkConfig) => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig],
    });
    return true;
  } catch (error) {
    console.error('Failed to add network:', error);
    return false;
  }
};