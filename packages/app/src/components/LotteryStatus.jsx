import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Trophy, Users, Ticket, AlertCircle, Crown, RefreshCw } from 'lucide-react'
import { useLotteryData, useTimeRemaining, useEndLottery, useRestartLottery } from '../hooks/useLottery'
import { LOTTERY_STATES, LOTTERY_STATE_LABELS } from '../constants'
import { formatTimeRemaining, formatPrizePool, formatNumber, calculateWinChance } from '../utils/formatters'
import PurpleButton from './PurpleButton'
import useWalletStore from '../stores/walletStore'

const EndLotteryButton = () => {
  const { mutate: endLottery, isLoading: isEndingLottery } = useEndLottery()
  const { isConnected } = useWalletStore()

  const handleEndLottery = () => {
      endLottery()
  }

  if (!isConnected) return null

  return (
    <PurpleButton
      onClick={handleEndLottery}
      disabled={isEndingLottery}
      className="bg-red-600 hover:bg-red-700 border-red-500"
    >
      {isEndingLottery ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Ending Lottery...
        </>
      ) : (
        'End Lottery'
      )}
    </PurpleButton>
  )
}

const RestartLotteryButton = () => {
  const { mutate: restartLottery, isLoading: isRestartingLottery } = useRestartLottery()
  const { isConnected } = useWalletStore()

  const handleRestartLottery = () => {
    restartLottery()
  }

  if (!isConnected) return null

  return (
    <PurpleButton
      onClick={handleRestartLottery}
      disabled={isRestartingLottery}
      className="bg-blue-600 hover:bg-blue-700 border-blue-500"
    >
      {isRestartingLottery ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Restarting Lottery...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Restart Lottery
        </>
      )}
    </PurpleButton>
  )
}

const LotteryStatus = () => {
  const { data: lotteryData, isLoading, error, refresh } = useLotteryData()
  const timeRemaining = useTimeRemaining(lotteryData?.round?.endTime)

  if (isLoading) {
    return (
      <div className="glass-card p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded mb-4"></div>
          <div className="h-32 bg-gray-600 rounded mb-4"></div>
          <div className="h-4 bg-gray-600 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold mb-2">Error Loading Lottery</h3>
          <p className="text-gray-400">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!lotteryData) return null

  const { round, playerTickets, totalPlayers, ticketPrice, lotteryDuration } = lotteryData
  const isOpen = round.state === LOTTERY_STATES.OPEN
  const isCalculating = round.state === LOTTERY_STATES.CALCULATING
  const isClosed = round.state === LOTTERY_STATES.CLOSED
  const hasWinner = round.winner !== '0x0000000000000000000000000000000000000000'
  const winChance = calculateWinChance(playerTickets, round.totalTickets)

  const getStatusColor = () => {
    if (isOpen) return 'text-green-400'
    if (isCalculating) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusIcon = () => {
    if (isOpen) return <Clock className="w-5 h-5" />
    if (isCalculating) return <AlertCircle className="w-5 h-5 animate-spin" />
    return <Crown className="w-5 h-5" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Round <span className="font-barcode text-3xl">#{round.id}</span></h2>
            <div className={`flex items-center gap-2 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="font-semibold">{LOTTERY_STATE_LABELS[round.state]}</span>
          </div>
        </div>

        {/* Prize Pool */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-400 mb-2">Prize Pool</div>
          <motion.div
            className="text-4xl font-bold text-lottery-gold font-mono"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {formatPrizePool(round.prizePool)}
          </motion.div>
        </div>

        {/* Time Remaining or Expired Status */}
        {isOpen && (
          <div className="text-center mb-6">
            {timeRemaining.isExpired ? (
              <>
                <div className="text-sm text-gray-400 mb-2">Status</div>
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="text-2xl font-bold text-red-400">
                    EXPIRED
                  </div>
                  {round.totalTickets > 0 ? <EndLotteryButton /> : <RestartLotteryButton />}
                </div>
                {round.totalTickets > 0 ? (
                  <div className="text-xs text-gray-500">
                    Ready to end • Can be ended by anyone
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    No participants • Ready to restart
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-sm text-gray-400 mb-2">Time Remaining</div>
                <div className="text-2xl font-bold text-primary-400">
                  {formatTimeRemaining(timeRemaining)}
                </div>
                
                {/* Progress Bar */}
                <div className="progress-bar mt-3">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.max(0, Math.min(100, 100 - (timeRemaining.total / (parseInt(lotteryDuration) * 1000)) * 100))}%` 
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Winner Display */}
        {hasWinner && (
          <motion.div
            className="text-center mb-6 p-4 bg-lottery-gold/10 border border-lottery-gold/30 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Crown className="w-8 h-8 mx-auto mb-2 text-lottery-gold" />
            <div className="text-sm text-gray-400">Winner</div>
            <div className="text-lg font-bold text-lottery-gold">
              {round.winner.slice(0, 6)}...{round.winner.slice(-4)}
            </div>
            {round.prizeClaimed && (
              <div className="text-sm text-green-400 mt-1">Prize Claimed ✓</div>
            )}
          </motion.div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-600/20 rounded-full flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Tickets</div>
              <div className="text-xl font-bold">{formatNumber(round.totalTickets)}</div>
            </div>
          </div>
        </div>

        {/* Total Players */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Players</div>
              <div className="text-xl font-bold">{formatNumber(totalPlayers)}</div>
            </div>
          </div>
        </div>

        {/* Your Tickets */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Your Tickets</div>
              <div className="text-xl font-bold">{formatNumber(playerTickets)}</div>
            </div>
          </div>
        </div>

        {/* Win Chance */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Your Win Chance</div>
              <div className="text-xl font-bold">
                {playerTickets > 0 ? `${winChance}%` : '0%'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Price Info */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-gray-400">Ticket Price:</span>
          </div>
          <div className="font-semibold">{ticketPrice} POL</div>
        </div>
      </div>
    </div>
  )
}

export default LotteryStatus