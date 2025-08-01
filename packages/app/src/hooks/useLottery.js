import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useContract, useContractRead } from './useContract'
import { ethers } from 'ethers'
import { LOTTERY_STATES } from '../constants'
import useWalletStore from '../stores/walletStore'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

// Helper function to get claim transaction hash with chunked querying
const getClaimTransactionHash = async (contract, roundId) => {
  const filter = contract.filters.PrizeClaimed(roundId)
  const provider = contract.provider
  
  try {
    // Get current block number
    const currentBlock = await provider.getBlockNumber()
    
    // Define block ranges to search (chunked approach)
    const chunkSize = 5000 // Smaller chunks for better reliability
    const maxBlocksToSearch = 50000 // Total range to search
    const startBlock = Math.max(0, currentBlock - maxBlocksToSearch)
    
    // Search in chunks from most recent to oldest
    for (let fromBlock = currentBlock; fromBlock > startBlock; fromBlock -= chunkSize) {
      const toBlock = fromBlock
      const fromBlockActual = Math.max(startBlock, fromBlock - chunkSize + 1)
      
      try {
        const events = await contract.queryFilter(filter, fromBlockActual, toBlock)
        if (events.length > 0) {
          console.log(`Found claim transaction for round ${roundId}: ${events[0].transactionHash}`)
          return events[0].transactionHash
        }
      } catch (chunkError) {
        console.warn(`Chunk query failed for blocks ${fromBlockActual}-${toBlock}:`, chunkError.message)
        continue // Try next chunk
      }
    }
    
    console.warn(`No PrizeClaimed events found for round ${roundId} despite prizeClaimed=true`)
    return null
  } catch (error) {
    console.error(`Failed to get claim transaction for round ${roundId}:`, error)
    return null
  }
}

export const useLotteryData = () => {
  const contract = useContractRead()
  const { address } = useWalletStore()
  const queryClient = useQueryClient()

  const query = useQuery(
    ['lotteryData'],  // Remove address from cache key to prevent wallet-specific caching issues
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
        
        // Always try to get players list for total count
        try {
          players = await contract.getPlayers(currentRoundId)
        } catch (error) {
          console.warn('Failed to fetch players list:', error)
        }
        
        // Only get player-specific data if wallet is connected
        if (address) {
          try {
            playerTickets = await contract.getPlayerTickets(address, currentRoundId)
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
      refetchInterval: 5000, // Reduced from 3s to 5s to decrease API calls
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 10000, // Increased from 1s to 10s to reduce cache thrashing
      cacheTime: 60000, // Increased to 1 minute for better performance
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Lottery data query failed:', error)
      }
    }
  )

  // Add manual refresh function
  const refresh = () => {
    queryClient.invalidateQueries(['lotteryData'])
    queryClient.invalidateQueries(['lotteryHistory'])
  }

  // Listen for contract events to auto-refresh data
  useEffect(() => {
    if (!contract) return

    const onTicketsPurchased = () => {
      console.log('Tickets purchased event detected, refreshing data...')
      refresh()
    }

    const onLotteryEnded = () => {
      console.log('Lottery ended event detected, refreshing data...')
      refresh()
    }

    const onWinnerSelected = () => {
      console.log('Winner selected event detected, refreshing data...')
      refresh()
    }

    const onPrizeClaimed = () => {
      console.log('Prize claimed event detected, refreshing data...')
      refresh()
    }

    // Set up event listeners
    try {
      contract.on('TicketsPurchased', onTicketsPurchased)
      contract.on('LotteryEnded', onLotteryEnded)
      contract.on('WinnerSelected', onWinnerSelected)
      contract.on('PrizeClaimed', onPrizeClaimed)

      console.log('Contract event listeners set up successfully')
    } catch (error) {
      console.warn('Failed to set up contract event listeners:', error)
    }

    // Cleanup listeners on unmount
    return () => {
      try {
        contract.off('TicketsPurchased', onTicketsPurchased)
        contract.off('LotteryEnded', onLotteryEnded)
        contract.off('WinnerSelected', onWinnerSelected)
        contract.off('PrizeClaimed', onPrizeClaimed)
      } catch (error) {
        console.warn('Error cleaning up event listeners:', error)
      }
    }
  }, [contract, refresh])

  return {
    ...query,
    refresh
  }
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
        queryClient.invalidateQueries(['lotteryHistory'])
        
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
        queryClient.invalidateQueries(['lotteryHistory'])
        
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
        queryClient.invalidateQueries(['lotteryHistory'])
        
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

export const useRestartLottery = () => {
  const contract = useContract()
  const queryClient = useQueryClient()

  return useMutation(
    async () => {
      if (!contract) throw new Error('Contract not available')

      const tx = await contract.restartLottery()
      const loadingToast = toast.loading('Restarting lottery...')
      
      try {
        await tx.wait()
        toast.dismiss(loadingToast)
        toast.success('Lottery restarted! New round has begun.')
        
        queryClient.invalidateQueries(['lotteryData'])
        queryClient.invalidateQueries(['lotteryHistory'])
        
        return tx
      } catch (error) {
        toast.dismiss(loadingToast)
        throw error
      }
    },
    {
      onError: (error) => {
        toast.error(error.message || 'Failed to restart lottery')
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


export const useLotteryHistory = (limit = 10) => {
  const contract = useContractRead()

  return useQuery(
    ['lotteryHistory', limit],
    async () => {
      if (!contract) return []

      try {
        const currentRoundId = await contract.getCurrentRoundId()
        const currentRoundNumber = Number(currentRoundId)
        
        // Get history of completed rounds (excluding current round)
        const historyPromises = []
        const startRound = Math.max(1, currentRoundNumber - limit)
        
        for (let roundId = currentRoundNumber - 1; roundId >= startRound; roundId--) {
          if (roundId > 0) {
            historyPromises.push(
              contract.getLotteryRound(roundId).then(async (roundData) => {
                const [id, startTime, endTime, totalTickets, prizePool, winner, ended, prizeClaimed, state] = roundData
                
                // Only include rounds that have ended and have a winner
                if (ended && winner !== ethers.ZeroAddress) {
                  // Get players count for this round
                  let totalPlayers = 0
                  try {
                    const players = await contract.getPlayers(roundId)
                    totalPlayers = players.length
                  } catch (error) {
                    console.warn(`Failed to get players for round ${roundId}:`, error)
                  }

                  // Get prize claim transaction hash if prize was claimed
                  let claimTransactionHash = null
                  if (prizeClaimed) {
                    try {
                      claimTransactionHash = await getClaimTransactionHash(contract, roundId)
                    } catch (error) {
                      console.warn(`Failed to get claim transaction for round ${roundId}:`, error)
                    }
                  }

                  return {
                    id: Number(id),
                    startTime: Number(startTime) * 1000, // Convert to milliseconds
                    endTime: Number(endTime) * 1000,
                    totalTickets: Number(totalTickets),
                    prizePool: ethers.formatEther(prizePool),
                    winner: winner,
                    ended: ended,
                    prizeClaimed: prizeClaimed,
                    state: Number(state),
                    totalPlayers: totalPlayers,
                    claimTransactionHash: claimTransactionHash
                  }
                }
                return null
              }).catch(error => {
                console.warn(`Failed to fetch round ${roundId}:`, error)
                return null
              })
            )
          }
        }

        const results = await Promise.all(historyPromises)
        // Filter out null results and sort by round ID descending
        return results
          .filter(round => round !== null)
          .sort((a, b) => b.id - a.id)
          
      } catch (error) {
        console.error('Failed to fetch lottery history:', error)
        throw error
      }
    },
    {
      enabled: !!contract,
      staleTime: 10000, // Cache for 10 seconds (reduced from 60s)
      cacheTime: 300000, // Keep in cache for 5 minutes
      retry: 2,
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      onError: (error) => {
        console.error('Lottery history query failed:', error)
      }
    }
  )
}

export const useFeeCalculation = (ticketCount) => {
  const contract = useContractRead()
  const { data: lotteryData } = useLotteryData()

  return useQuery(
    ['feeCalculation', ticketCount, lotteryData?.round?.totalTickets],
    async () => {
      if (!contract || !lotteryData || ticketCount <= 0) return null

      try {
        const currentTotalTickets = parseInt(lotteryData.round.totalTickets) || 0
        const [feeStructure, calculatedFee] = await Promise.all([
          contract.getFeeStructure(),
          contract.calculateFeeForTickets(currentTotalTickets, ticketCount)
        ])

        const [freeTierLimit, midTierLimit, midTierFeePercentage, highTierFeePercentage] = feeStructure
        
        return {
          totalFee: ethers.formatEther(calculatedFee),
          feeStructure: {
            freeTierLimit: freeTierLimit.toString(),
            midTierLimit: midTierLimit.toString(),
            midTierFeePercentage: (parseInt(midTierFeePercentage) / 100).toString(), // Convert basis points to percentage
            highTierFeePercentage: (parseInt(highTierFeePercentage) / 100).toString()
          },
          currentTotalTickets: currentTotalTickets
        }
      } catch (error) {
        console.error('Failed to calculate fee:', error)
        return null
      }
    },
    {
      enabled: !!contract && !!lotteryData && ticketCount > 0,
      staleTime: 10000,
      cacheTime: 30000
    }
  )
}