import React from 'react'
import { motion } from 'framer-motion'
import { Crown, Gift, CheckCircle, Loader2 } from 'lucide-react'
import { useLotteryData, useClaimPrize } from '../hooks/useLottery'
import { LOTTERY_STATES } from '../constants'
import { formatPrizePool } from '../utils/formatters'
import useWalletStore from '../stores/walletStore'

const PrizeClaim = () => {
  const { data: lotteryData, isLoading } = useLotteryData()
  const { mutate: claimPrize, isLoading: isClaiming } = useClaimPrize()
  const { address, isConnected } = useWalletStore()

  if (isLoading || !lotteryData) {
    return null
  }

  const { round } = lotteryData
  const hasWinner = round.winner !== '0x0000000000000000000000000000000000000000'
  const isWinner = hasWinner && address && round.winner.toLowerCase() === address.toLowerCase()
  const isClosed = round.state === LOTTERY_STATES.CLOSED
  const canClaim = isWinner && isClosed && !round.prizeClaimed

  if (!hasWinner || !isWinner) {
    return null
  }

  const handleClaimPrize = () => {
    if (canClaim) {
      claimPrize(round.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 border-2 border-lottery-gold/50 bg-gradient-to-br from-lottery-gold/10 to-transparent"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <Crown className="w-16 h-16 mx-auto mb-4 text-lottery-gold animate-pulse-glow" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-lottery-gold mb-2">
          🎉 Congratulations! 🎉
        </h2>
        
        <p className="text-gray-300 mb-4">
          You won the lottery! Your prize is ready to be claimed.
        </p>
        
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Your Prize</div>
          <div className="text-3xl font-bold text-lottery-gold">
            {formatPrizePool(round.prizePool)}
          </div>
        </div>

        {round.prizeClaimed ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Prize Already Claimed!</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Your prize has been successfully transferred to your wallet.
            </p>
          </div>
        ) : (
          <motion.button
            onClick={handleClaimPrize}
            disabled={!canClaim || isClaiming}
            className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 glow-button ${
              canClaim && !isClaiming
                ? 'bg-lottery-gold hover:bg-yellow-500 text-black shadow-glow-gold'
                : 'bg-gray-600 cursor-not-allowed text-gray-400'
            }`}
            whileHover={canClaim && !isClaiming ? { scale: 1.02 } : {}}
            whileTap={canClaim && !isClaiming ? { scale: 0.98 } : {}}
          >
            {isClaiming ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Claiming Prize...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Gift className="w-5 h-5" />
                <span>Claim Your Prize</span>
              </div>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default PrizeClaim