import { useMemo } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ABI, LOTTERY_CONFIG } from '../constants'
import useWalletStore from '../stores/walletStore'

export const useContract = () => {
  const { signer, provider, isConnecting } = useWalletStore()

  return useMemo(() => {
    // Wait for wallet initialization to complete before creating contract
    if (isConnecting) return null
    if (!signer && !provider) return null

    try {
      const contractProvider = signer || provider
      const contract = new ethers.Contract(
        LOTTERY_CONFIG.POLYGON.lotteryAddress,
        CONTRACT_ABI,
        contractProvider
      )

      return contract
    } catch (error) {
      console.error('Failed to create contract instance:', error)
      return null
    }
  }, [signer, provider, isConnecting])
}

export const useContractRead = () => {
  const { provider, isConnecting } = useWalletStore()

  return useMemo(() => {
    try {
      // Use wallet provider if available and not connecting, otherwise use default provider
      const useDefaultProvider = !provider || isConnecting
      const contractProvider = useDefaultProvider ? 
        new ethers.JsonRpcProvider(LOTTERY_CONFIG.POLYGON.rpcUrl) : 
        provider
      
      const contract = new ethers.Contract(
        LOTTERY_CONFIG.POLYGON.lotteryAddress,
        CONTRACT_ABI,
        contractProvider
      )

      return contract
    } catch (error) {
      console.error('Failed to create contract instance:', error)
      return null
    }
  }, [provider, isConnecting])
}