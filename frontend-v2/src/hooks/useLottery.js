import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useContract, useContractRead } from './useContract'
import { ethers } from 'ethers'
import { LOTTERY_STATES } from '../constants'
import useWalletStore from '../stores/walletStore'
import toast from 'react-hot-toast'

export const useLotteryData = () => {
  const contract = useContractRead()
  const { address } = useWalletStore()

  return useQuery(
    ['lotteryData', address],
    async () => {
      if (!contract) return null

      try {
        const [
          currentRoundId,
          ticketPrice,
          maxTickets,
          lotteryDuration
        ] = await Promise.all([
          contract.getCurrentRoundId(),
          contract.getTicketPrice(),
          contract.getMaxTicketsPerPurchase(),
          contract.getLotteryDuration()
        ])

        const roundData = await contract.getLotteryRound(currentRoundId)
        
        let playerTickets = 0
        let players = []
        
        if (address) {
          try {
            playerTickets = await contract.getPlayerTickets(address, currentRoundId)
            players = await contract.getPlayers(currentRoundId)
          } catch (playerError) {
            console.warn('Failed to fetch player data:', playerError)
            // Continue without player data
          }
        }

        return {
          currentRoundId: currentRoundId.toString(),
          ticketPrice: ethers.formatEther(ticketPrice),
          maxTickets: maxTickets.toString(),
          lotteryDuration: lotteryDuration.toString(),
          round: {
            id: roundData[0].toString(),
            startTime: Number(roundData[1]) * 1000, // Convert to milliseconds
            endTime: Number(roundData[2]) * 1000,
            totalTickets: roundData[3].toString(),
            prizePool: ethers.formatEther(roundData[4]),
            winner: roundData[5],
            ended: roundData[6],
            prizeClaimed: roundData[7],
            state: Number(roundData[8]) // Ensure state is converted to number
          },
          playerTickets: playerTickets.toString(),
          players: players || [],
          totalPlayers: players ? players.length : 0
        }
      } catch (error) {
        console.error('Failed to fetch lottery data:', error)
        throw error
      }
    },
    {
      enabled: !!contract,
      refetchInterval: 5000, // Refresh every 5 seconds
      refetchOnWindowFocus: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Lottery data query failed:', error)
      }
    }
  )
}

export const useBuyTickets = () => {
  const contract = useContract()
  const queryClient = useQueryClient()
  const { updateBalance } = useWalletStore()

  return useMutation(
    async ({ ticketCount }) => {
      if (!contract) throw new Error('Contract not available')

      const ticketPrice = await contract.getTicketPrice()
      const totalCost = ticketPrice * BigInt(ticketCount)

      const tx = await contract.buyTickets(ticketCount, {
        value: totalCost
      })

      const loadingToast = toast.loading('Processing ticket purchase...')
      
      try {
        await tx.wait()
        toast.dismiss(loadingToast)
        toast.success(`Successfully purchased ${ticketCount} ticket(s)!`)
        
        // Update balance and refetch lottery data
        await updateBalance()
        queryClient.invalidateQueries(['lotteryData'])
        
        return tx
      } catch (error) {
        toast.dismiss(loadingToast)
        throw error
      }
    },
    {
      onError: (error) => {
        toast.error(error.message || 'Failed to purchase tickets')
      }
    }
  )
}

export const useClaimPrize = () => {
  const contract = useContract()
  const queryClient = useQueryClient()
  const { updateBalance } = useWalletStore()

  return useMutation(
    async (roundId) => {
      if (!contract) throw new Error('Contract not available')

      const tx = await contract.claimPrize(roundId)
      const loadingToast = toast.loading('Claiming prize...')
      
      try {
        await tx.wait()
        toast.dismiss(loadingToast)
        toast.success('Prize claimed successfully!')
        
        // Update balance and refetch lottery data
        await updateBalance()
        queryClient.invalidateQueries(['lotteryData'])
        
        return tx
      } catch (error) {
        toast.dismiss(loadingToast)
        throw error
      }
    },
    {
      onError: (error) => {
        toast.error(error.message || 'Failed to claim prize')
      }
    }
  )
}

export const useEndLottery = () => {
  const contract = useContract()
  const queryClient = useQueryClient()

  return useMutation(
    async () => {
      if (!contract) throw new Error('Contract not available')

      const tx = await contract.endLottery()
      const loadingToast = toast.loading('Ending lottery...')
      
      try {
        await tx.wait()
        toast.dismiss(loadingToast)
        toast.success('Lottery ended! Winner will be selected soon.')
        
        queryClient.invalidateQueries(['lotteryData'])
        
        return tx
      } catch (error) {
        toast.dismiss(loadingToast)
        throw error
      }
    },
    {
      onError: (error) => {
        toast.error(error.message || 'Failed to end lottery')
      }
    }
  )
}

export const useTimeRemaining = (endTime) => {
  const { data } = useQuery(
    ['timeRemaining', endTime],
    () => {
      const now = Date.now()
      const remaining = endTime - now
      
      if (remaining <= 0) {
        return {
          total: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        }
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      return {
        total: remaining,
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
      }
    },
    {
      enabled: !!endTime,
      refetchInterval: 1000 // Update every second
    }
  )

  return data || { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
}