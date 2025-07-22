import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Plus, Minus, AlertCircle, Clock, Loader2, Wallet } from 'lucide-react'
import { useLotteryData, useBuyTickets } from '../hooks/useLottery'
import { LOTTERY_STATES } from '../constants'
import { formatEther, formatNumber } from '../utils/formatters'
import useWalletStore from '../stores/walletStore'

const TicketPurchase = () => {
  const [ticketCount, setTicketCount] = useState(1)
  const { data: lotteryData, isLoading } = useLotteryData()
  const { mutate: buyTickets, isLoading: isPurchasing } = useBuyTickets()
  const { balance, isConnected } = useWalletStore()

  if (isLoading || !lotteryData) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded mb-4"></div>
          <div className="h-32 bg-gray-600 rounded"></div>
        </div>
      </div>
    )
  }

  const { round, ticketPrice, maxTickets } = lotteryData
  const isOpen = round.state === LOTTERY_STATES.OPEN
  const isCalculating = round.state === LOTTERY_STATES.CALCULATING
  const isClosed = round.state === LOTTERY_STATES.CLOSED
  
  const totalCost = (parseFloat(ticketPrice) * ticketCount).toFixed(4)
  const hasInsufficientBalance = !balance || parseFloat(balance) < parseFloat(totalCost)
  const maxAllowedTickets = parseInt(maxTickets)
  
  const canPurchase = isConnected && isOpen && !hasInsufficientBalance && ticketCount > 0
  
  // Debug logging
  console.log('Purchase conditions:', {
    isConnected,
    isOpen,
    hasInsufficientBalance,
    ticketCount,
    balance,
    totalCost,
    roundState: round.state,
    roundStateType: typeof round.state,
    expectedOpen: LOTTERY_STATES.OPEN,
    stateComparison: round.state === LOTTERY_STATES.OPEN,
    canPurchase
  })

  const handleTicketCountChange = (newCount) => {
    const count = Math.max(1, Math.min(maxAllowedTickets, newCount))
    setTicketCount(count)
  }

  const handlePurchase = () => {
    if (canPurchase) {
      buyTickets({ ticketCount })
    }
  }

  const getStatusMessage = () => {
    if (!isConnected) return 'Connect wallet to purchase tickets'
    if (isCalculating) return 'Lottery is calculating winner...'
    if (isClosed) return 'Lottery is closed'
    if (!isOpen) return `Lottery state: ${round.state} (not open)`
    // if (hasInsufficientBalance) return 'Insufficient POL balance'
    if (ticketCount <= 0) return 'Select at least 1 ticket'
    return null
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Buy Tickets</h3>
          <p className="text-sm text-gray-400">
            Max {maxAllowedTickets} tickets per purchase
          </p>
        </div>
      </div>

      {/* Status Message */}
      {getStatusMessage() && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{getStatusMessage()}</span>
          </div>
        </div>
      )}

      {/* Ticket Counter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">Number of Tickets</label>
          <div className="text-sm text-gray-400">
            {ticketPrice} POL each
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => handleTicketCountChange(ticketCount - 1)}
            disabled={ticketCount <= 1}
            className="w-10 h-10 bg-gray-800/50 hover:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Minus className="w-4 h-4" />
          </motion.button>
          
          <div className="flex-1 relative">
            <input
              type="number"
              value={ticketCount}
              onChange={(e) => handleTicketCountChange(parseInt(e.target.value) || 1)}
              min="1"
              max={maxAllowedTickets}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <motion.button
            onClick={() => handleTicketCountChange(ticketCount + 1)}
            disabled={ticketCount >= maxAllowedTickets}
            className="w-10 h-10 bg-gray-800/50 hover:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Quick Select */}
        <div className="flex gap-2 mt-3 justify-center">
          {[1, 5, 10, 25, 50, 75, 100].map((count) => (
            <motion.button
              key={count}
              onClick={() => handleTicketCountChange(count)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                ticketCount === count
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800/50 hover:bg-gray-900/50 text-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {count}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Tickets</span>
          <span>{formatNumber(ticketCount)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Price per ticket</span>
          <span>{ticketPrice} POL</span>
        </div>
        <div className="h-px bg-gray-600 my-3"></div>
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Cost</span>
          <span className="text-primary-400">{totalCost} POL</span>
        </div>
      </div>

      {/* Purchase Button */}
      <motion.button
        onClick={handlePurchase}
        disabled={!canPurchase || isPurchasing}
        className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 glow-button ${
          canPurchase && !isPurchasing
            ? 'bg-primary-600 hover:bg-primary-700 text-white'
            : 'bg-gray-600 cursor-not-allowed text-gray-400'
        }`}
        whileHover={canPurchase && !isPurchasing ? { scale: 1.02 } : {}}
        whileTap={canPurchase && !isPurchasing ? { scale: 0.98 } : {}}
      >
        {isPurchasing ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </div>
        ) : hasInsufficientBalance && isConnected && isOpen ? (
          <div className="flex items-center justify-center gap-2">
            <Wallet className="w-5 h-5" />
            <span>Add funds to buy {formatNumber(ticketCount)} ticket{ticketCount > 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Buy {formatNumber(ticketCount)} Ticket{ticketCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </motion.button>

      {/* Balance Display */}
      {isConnected && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
          <span>Your Balance:</span>
          <span className={hasInsufficientBalance ? 'text-red-400' : ''}>
            {formatEther(balance)} POL
          </span>
        </div>
      )}
    </div>
  )
}

export default TicketPurchase