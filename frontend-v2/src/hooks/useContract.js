import { useMemo } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ABI, LOTTERY_CONFIG } from '../constants'
import useWalletStore from '../stores/walletStore'

export const useContract = () => {
  const { signer, provider } = useWalletStore()

  return useMemo(() => {
    if (!signer && !provider) return null

    try {
      const contractProvider = signer || provider
      const contract = new ethers.Contract(
        LOTTERY_CONFIG.POLYGON_AMOY.lotteryAddress,
        CONTRACT_ABI,
        contractProvider
      )

      return contract
    } catch (error) {
      console.error('Failed to create contract instance:', error)
      return null
    }
  }, [signer, provider])
}

export const useContractRead = () => {
  const { provider } = useWalletStore()

  return useMemo(() => {
    if (!provider) return null

    try {
      const contract = new ethers.Contract(
        LOTTERY_CONFIG.POLYGON_AMOY.lotteryAddress,
        CONTRACT_ABI,
        provider
      )

      return contract
    } catch (error) {
      console.error('Failed to create contract instance:', error)
      return null
    }
  }, [provider])
}