import React from 'react'
import { motion } from 'framer-motion'
import { History, Crown, Calendar, Users, Trophy, ExternalLink } from 'lucide-react'
import { formatPrizePool, formatAddress, getRelativeTime, getExplorerUrl } from '../utils/formatters'

const LotteryHistory = () => {
  // Mock data for demonstration - in real app, this would come from a query
  const mockHistory = [
    {
      id: 4,
      startTime: Date.now() - 14 * 24 * 60 * 60 * 1000,
      endTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
      winner: '0x742d35Cc6634C0532925a3b8D0e9A0A6A6d29e3f',
      prizePool: '2.85',
      totalTickets: 142,
      totalPlayers: 28,
      txHash: '0x123...abc'
    },
    {
      id: 3,
      startTime: Date.now() - 21 * 24 * 60 * 60 * 1000,
      endTime: Date.now() - 14 * 24 * 60 * 60 * 1000,
      winner: '0x8ba1f109551bD432803012645Hac136c22C8e6c1',
      prizePool: '1.92',
      totalTickets: 96,
      totalPlayers: 19,
      txHash: '0x456...def'
    },
    {
      id: 2,
      startTime: Date.now() - 28 * 24 * 60 * 60 * 1000,
      endTime: Date.now() - 21 * 24 * 60 * 60 * 1000,
      winner: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      prizePool: '3.47',
      totalTickets: 173,
      totalPlayers: 34,
      txHash: '0x789...ghi'
    }
  ]

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

      <div className="space-y-4">
        {mockHistory.map((round, index) => (
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
                  </div>
                </div>
              </div>
              
              <motion.a
                href={getExplorerUrl(round.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>View TX</span>
                <ExternalLink className="w-3 h-3" />
              </motion.a>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <motion.button
          className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View All History
        </motion.button>
      </div>
    </div>
  )
}

export default LotteryHistory