import React, { useState } from 'react';
import { Ticket, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { formatEther, isValidNumber, calculateWinProbability } from '../utils/helpers';

const TicketPurchase = ({ 
  ticketPrice, 
  maxTickets, 
  currentRoundId, 
  totalTickets, 
  userTickets, 
  onBuyTickets, 
  loading, 
  error,
  isWalletConnected,
  isCorrectNetwork,
  lotteryState,
  className = "" 
}) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [success, setSuccess] = useState(false);

  const handleTicketCountChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= (maxTickets || 100)) {
      setTicketCount(value);
    }
  };

  const handleBuyTickets = async () => {
    if (!isValidNumber(ticketCount) || ticketCount < 1 || ticketCount > (maxTickets || 100)) {
      return;
    }

    try {
      setSuccess(false);
      await onBuyTickets(ticketCount);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error buying tickets:', error);
    }
  };

  const totalCost = ticketPrice && ticketCount ? 
    formatEther(ticketPrice * BigInt(ticketCount)) : '0';

  const winProbability = calculateWinProbability(
    userTickets + ticketCount, 
    totalTickets + ticketCount
  );

  const canBuyTickets = isWalletConnected && isCorrectNetwork && lotteryState === 0;
  const isLotteryEnded = lotteryState === 1 || lotteryState === 2;

  return (
    <div className={`bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 rounded-2xl p-8 backdrop-blur-sm ${className}`}>
      <div className="flex items-center gap-3 mb-8">
        <Ticket className="w-8 h-8 text-blue-400" />
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Buy Tickets</h3>
      </div>

      {!isWalletConnected && (
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 text-yellow-400">
            <AlertCircle className="w-6 h-6" />
            <span className="font-semibold">Connect your wallet to buy tickets</span>
          </div>
        </div>
      )}

      {isWalletConnected && !isCorrectNetwork && (
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <span className="font-semibold">Switch to the correct network</span>
          </div>
        </div>
      )}

      {isLotteryEnded && (
        <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 border border-gray-500/50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 text-gray-400">
            <AlertCircle className="w-6 h-6" />
            <span className="font-semibold">Lottery has ended - no more tickets can be purchased</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-base font-semibold text-gray-300 mb-3">
            Number of Tickets
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max={maxTickets || 100}
              value={ticketCount}
              onChange={handleTicketCountChange}
              disabled={!canBuyTickets || loading}
              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            />
            <button
              onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
              disabled={!canBuyTickets || loading || ticketCount <= 1}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-lg font-bold hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              -
            </button>
            <button
              onClick={() => setTicketCount(Math.min(maxTickets || 100, ticketCount + 1))}
              disabled={!canBuyTickets || loading || ticketCount >= (maxTickets || 100)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-lg font-bold hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              +
            </button>
          </div>
          <div className="text-sm text-gray-400 mt-2 font-medium">
            Max {maxTickets || 100} tickets per purchase
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-700/50 to-slate-600/30 border border-slate-600/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-300 font-medium">Total Cost:</span>
            <span className="text-white font-bold text-lg">{totalCost} ETH</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-300 font-medium">Your Tickets:</span>
            <span className="text-white font-semibold">{userTickets || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-medium">Win Probability:</span>
            <span className="text-blue-400 font-bold text-lg">{winProbability}%</span>
          </div>
        </div>

        <button
          onClick={handleBuyTickets}
          disabled={!canBuyTickets || loading || ticketCount < 1}
          className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-6 h-6" />
              Buy {ticketCount} Ticket{ticketCount > 1 ? 's' : ''} for {totalCost} ETH
            </>
          )}
        </button>

        {success && (
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/50 rounded-xl p-4">
            <div className="flex items-center gap-3 text-green-400">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Tickets purchased successfully!</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/50 rounded-xl p-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-600/50">
        <div className="text-sm text-gray-400 space-y-2">
          <p className="font-medium">• Ticket price: {ticketPrice ? formatEther(ticketPrice) : '0.01'} ETH</p>
          <p className="font-medium">• Winners selected using Chainlink VRF</p>
          <p className="font-medium">• Prize pool distributed to winner</p>
          <p className="font-medium">• New lottery starts automatically</p>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchase;