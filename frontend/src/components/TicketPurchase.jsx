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
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Ticket className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Buy Tickets</h3>
      </div>

      {!isWalletConnected && (
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            <span>Connect your wallet to buy tickets</span>
          </div>
        </div>
      )}

      {isWalletConnected && !isCorrectNetwork && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>Switch to the correct network</span>
          </div>
        </div>
      )}

      {isLotteryEnded && (
        <div className="bg-gray-900/20 border border-gray-500 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="w-5 h-5" />
            <span>Lottery has ended - no more tickets can be purchased</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Number of Tickets
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={maxTickets || 100}
              value={ticketCount}
              onChange={handleTicketCountChange}
              disabled={!canBuyTickets || loading}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
              disabled={!canBuyTickets || loading || ticketCount <= 1}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <button
              onClick={() => setTicketCount(Math.min(maxTickets || 100, ticketCount + 1))}
              disabled={!canBuyTickets || loading || ticketCount >= (maxTickets || 100)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Max {maxTickets || 100} tickets per purchase
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Total Cost:</span>
            <span className="text-white font-semibold">{totalCost} ETH</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Your Tickets:</span>
            <span className="text-white">{userTickets || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Win Probability:</span>
            <span className="text-blue-400 font-semibold">{winProbability}%</span>
          </div>
        </div>

        <button
          onClick={handleBuyTickets}
          disabled={!canBuyTickets || loading || ticketCount < 1}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Buy {ticketCount} Ticket{ticketCount > 1 ? 's' : ''} for {totalCost} ETH
            </>
          )}
        </button>

        {success && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Tickets purchased successfully!</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 space-y-1">
          <p>• Ticket price: {ticketPrice ? formatEther(ticketPrice) : '0.01'} ETH</p>
          <p>• Winners selected using Chainlink VRF</p>
          <p>• Prize pool distributed to winner</p>
          <p>• New lottery starts automatically</p>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchase;