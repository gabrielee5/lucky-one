import React from 'react'
import { motion } from 'framer-motion'
import { History, Crown, Calendar, Users, Trophy, ExternalLink, AlertCircle, Loader } from 'lucide-react'
import { formatPrizePool, formatAddress, getRelativeTime, getExplorerUrl } from '../utils/formatters'
import { useLotteryHistory, useClaimPrize } from '../hooks/useLottery'
import useWalletStore from '../stores/walletStore'
import PurpleButton from './PurpleButton'

const LotteryHistory = () => {
  const { data: historyData, isLoading, error } = useLotteryHistory(5) // Get last 5 completed rounds
  const { address: connectedAddress } = useWalletStore()
  const { mutate: claimPrize, isLoading: isClaimingPrize } = useClaimPrize()

  // Debug log to see what data we're getting
  React.useEffect(() => {
    if (historyData && historyData.length > 0) {
      console.log('Lottery History Data:', historyData.map(round => ({
        id: round.id,
        prizeClaimed: round.prizeClaimed,
        claimTransactionHash: round.claimTransactionHash
      })))
    }
  }, [historyData])

  const handleClaimPrize = (roundId) => {
      claimPrize(roundId)
  }

  const canClaimPrize = (round) => {
    return (
      connectedAddress && 
      round.winner.toLowerCase() === connectedAddress.toLowerCase() && 
      !round.prizeClaimed
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
          <History className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Lottery History</h3>
          <p className="text-sm text-gray-400">
            Previous rounds and winners
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-primary-400 mr-2" />
          <span className="text-gray-400">Loading lottery history...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="w-6 h-6 text-red-400 mr-2" />
          <span className="text-gray-400">Failed to load history</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && historyData && historyData.length === 0 && (
        <div className="text-center py-8">
          <Crown className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <p className="text-gray-400">No completed lottery rounds yet</p>
          <p className="text-sm text-gray-500 mt-1">
            History will appear here once rounds are completed
          </p>
        </div>
      )}

      {/* History Data */}
      {!isLoading && !error && historyData && historyData.length > 0 && (
        <div className="space-y-4">
          {historyData.map((round, index) => (
            <motion.div
              key={round.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-lottery-gold/20 rounded-full flex items-center justify-center">
                    <Crown className="w-4 h-4 text-lottery-gold" />
                  </div>
                  <div>
                    <div className="font-semibold">Round #{round.id}</div>
                    <div className="text-sm text-gray-400">
                      {getRelativeTime(round.endTime)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lottery-gold">
                    {formatPrizePool(round.prizePool)}
                  </div>
                  <div className="text-sm text-gray-400">Prize Pool</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {round.totalPlayers} players
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {round.totalTickets} tickets
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Winner</div>
                    <div className="font-mono text-sm">
                      {formatAddress(round.winner)}
                      {canClaimPrize(round) && (
                        <span className="ml-2 text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                          You Won!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {canClaimPrize(round) && (
                    <PurpleButton
                      onClick={() => handleClaimPrize(round.id)}
                      disabled={isClaimingPrize}
                      className="bg-lottery-gold hover:bg-lottery-gold/80 border-lottery-gold text-black text-xs px-3 py-1"
                    >
                      {isClaimingPrize ? 'Claiming...' : 'Claim Prize'}
                    </PurpleButton>
                  )}
                  {round.prizeClaimed && (
                    <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                      Claimed
                    </span>
                  )}
                  {round.claimTransactionHash ? (
                    <motion.a
                      href={getExplorerUrl(round.claimTransactionHash, 'tx')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="View prize claim transaction on block explorer"
                    >
                      <span>View Claim</span>
                      <ExternalLink className="w-3 h-3" />
                    </motion.a>
                  ) : (
                    <motion.a
                      href={getExplorerUrl(round.winner, 'address')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="View winner address on block explorer"
                    >
                      <span>View Winner</span>
                      <ExternalLink className="w-3 h-3" />
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View All History Button */}
      {!isLoading && !error && historyData && historyData.length > 0 && (
        <div className="mt-6 text-center">
          <motion.button
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // This could open a modal or navigate to a dedicated history page
              console.log('View all history clicked - could implement pagination or modal')
            }}
          >
            View All History ({historyData.length} shown)
          </motion.button>
        </div>
      )}
    </div>
  )
}

export default LotteryHistory