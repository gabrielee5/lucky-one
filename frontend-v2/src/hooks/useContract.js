import { useMemo } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ABI, LOTTERY_CONFIG } from '../constants'
import useWalletStore from '../stores/walletStore'

export const useContract = () => {
  const { signer, provider } = useWalletStore()

  return useMemo(() => {
    if (!signer && !provider) return null

    const contractProvider = signer || provider
    const contract = new ethers.Contract(
      LOTTERY_CONFIG.POLYGON_AMOY.lotteryAddress,
      CONTRACT_ABI,
      contractProvider
    )

    return contract
  }, [signer, provider])
}

export const useContractRead = () => {
  const { provider } = useWalletStore()

  return useMemo(() => {
    if (!provider) return null

    const contract = new ethers.Contract(
      LOTTERY_CONFIG.POLYGON_AMOY.lotteryAddress,
      CONTRACT_ABI,
      provider
    )

    return contract
  }, [provider])
}