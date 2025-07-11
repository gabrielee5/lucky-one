import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { LOTTERY_ABI, CONTRACT_CONFIG } from '../utils/contractABI';
import { getErrorMessage } from '../utils/helpers';

export const useContract = (signer, contractAddress) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (signer && contractAddress) {
      try {
        const contractInstance = new ethers.Contract(contractAddress, LOTTERY_ABI, signer);
        setContract(contractInstance);
        setError(null);
      } catch (error) {
        console.error('Error creating contract instance:', error);
        setError('Failed to connect to contract');
      }
    } else {
      setContract(null);
    }
  }, [signer, contractAddress]);

  const executeTransaction = useCallback(async (methodName, args = [], options = {}) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract[methodName](...args, options);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error(`Error executing ${methodName}:`, error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const callView = useCallback(async (methodName, args = []) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const result = await contract[methodName](...args);
      return result;
    } catch (error) {
      console.error(`Error calling ${methodName}:`, error);
      throw error;
    }
  }, [contract]);

  const buyTickets = useCallback(async (ticketCount, ticketPrice) => {
    const value = ticketPrice * BigInt(ticketCount);
    return executeTransaction('buyTickets', [ticketCount], { value });
  }, [executeTransaction]);

  const claimPrize = useCallback(async (roundId) => {
    return executeTransaction('claimPrize', [roundId]);
  }, [executeTransaction]);

  const endLottery = useCallback(async () => {
    return executeTransaction('endLottery');
  }, [executeTransaction]);

  const getCurrentRoundId = useCallback(async () => {
    return callView('getCurrentRoundId');
  }, [callView]);

  const getLotteryRound = useCallback(async (roundId) => {
    return callView('getLotteryRound', [roundId]);
  }, [callView]);

  const getPlayerTickets = useCallback(async (player, roundId) => {
    return callView('getPlayerTickets', [player, roundId]);
  }, [callView]);

  const getPlayers = useCallback(async (roundId) => {
    return callView('getPlayers', [roundId]);
  }, [callView]);

  const getTicketPrice = useCallback(async () => {
    return callView('getTicketPrice');
  }, [callView]);

  const getMaxTicketsPerPurchase = useCallback(async () => {
    return callView('getMaxTicketsPerPurchase');
  }, [callView]);

  const getLotteryDuration = useCallback(async () => {
    return callView('getLotteryDuration');
  }, [callView]);

  const getContractBalance = useCallback(async () => {
    return callView('getContractBalance');
  }, [callView]);

  const listenToEvents = useCallback((eventName, callback) => {
    if (!contract) return;

    const eventFilter = contract.filters[eventName]();
    contract.on(eventFilter, callback);

    return () => {
      contract.off(eventFilter, callback);
    };
  }, [contract]);

  const getEventLogs = useCallback(async (eventName, fromBlock = 0, toBlock = 'latest') => {
    if (!contract) return [];

    try {
      const eventFilter = contract.filters[eventName]();
      const logs = await contract.queryFilter(eventFilter, fromBlock, toBlock);
      return logs;
    } catch (error) {
      console.error(`Error getting ${eventName} logs:`, error);
      return [];
    }
  }, [contract]);

  return {
    contract,
    loading,
    error,
    
    // Transaction methods
    buyTickets,
    claimPrize,
    endLottery,
    
    // View methods
    getCurrentRoundId,
    getLotteryRound,
    getPlayerTickets,
    getPlayers,
    getTicketPrice,
    getMaxTicketsPerPurchase,
    getLotteryDuration,
    getContractBalance,
    
    // Event methods
    listenToEvents,
    getEventLogs,
    
    // General methods
    executeTransaction,
    callView
  };
};