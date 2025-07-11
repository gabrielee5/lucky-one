import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG } from '../utils/contractABI';
import { isMetaMaskInstalled, switchNetwork, getErrorMessage } from '../utils/helpers';

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    if (isMetaMaskInstalled()) {
      checkConnection();
      setupEventListeners();
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0].address);
        setChainId(Number(network.chainId));
        
        await updateBalance(accounts[0].address, provider);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const updateBalance = async (address, provider) => {
    try {
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const setupEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
      if (provider) {
        updateBalance(accounts[0], provider);
      }
    }
  };

  const handleChainChanged = (chainId) => {
    setChainId(parseInt(chainId, 16));
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      await updateBalance(accounts[0], provider);

      // Check if we're on the correct network
      if (Number(network.chainId) !== CONTRACT_CONFIG.CHAIN_ID) {
        const switchSuccess = await switchNetwork(CONTRACT_CONFIG.CHAIN_ID);
        if (!switchSuccess) {
          setError(`Please switch to ${CONTRACT_CONFIG.NETWORK_NAME} network`);
        }
      }

    } catch (error) {
      console.error('Connection error:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance('0');
    setError(null);
  };

  const isConnected = () => {
    return account !== null && provider !== null && signer !== null;
  };

  const isCorrectNetwork = () => {
    return chainId === CONTRACT_CONFIG.CHAIN_ID;
  };

  const switchToCorrectNetwork = async () => {
    try {
      const success = await switchNetwork(CONTRACT_CONFIG.CHAIN_ID);
      if (success) {
        setError(null);
      }
      return success;
    } catch (error) {
      console.error('Error switching network:', error);
      setError(getErrorMessage(error));
      return false;
    }
  };

  const refreshBalance = async () => {
    if (account && provider) {
      await updateBalance(account, provider);
    }
  };

  return {
    account,
    provider,
    signer,
    chainId,
    balance,
    loading,
    error,
    connect,
    disconnect,
    isConnected: isConnected(),
    isCorrectNetwork: isCorrectNetwork(),
    switchToCorrectNetwork,
    refreshBalance,
    isMetaMaskInstalled: isMetaMaskInstalled()
  };
};