import React from 'react';
import { Clock, Users, DollarSign, Trophy, AlertCircle, Wallet } from 'lucide-react';
import { formatEther, formatTimeRemaining, getLotteryStateText, getLotteryStateColor } from '../utils/helpers';
import { formatCurrency, LOTTERY_CONSTANTS } from '../utils/contractABI';

const LotteryStatus = ({ 
  lotteryData, 
  ticketPrice, 
  loading, 
  error, 
  currentTime,
  accumulatedFees,
  isOwner,
  className = "" 
}) => {
  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 rounded-2xl p-8 backdrop-blur-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="h-24 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl"></div>
            <div className="h-24 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl"></div>
            <div className="h-24 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl"></div>
            <div className="h-24 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/50 rounded-2xl p-8 backdrop-blur-sm ${className}`}>
        <div className="flex items-center gap-3 text-red-400 mb-3">
          <AlertCircle className="w-6 h-6" />
          <span className="font-semibold text-lg">Error loading lottery data</span>
        </div>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (!lotteryData) {
    return (
      <div className={`bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 rounded-2xl p-8 backdrop-blur-sm ${className}`}>
        <div className="text-center text-gray-400">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No lottery data available</p>
        </div>
      </div>
    );
  }

  const {
    roundId,
    startTime,
    endTime,
    totalTickets,
    prizePool,
    winner,
    ended,
    prizeClaimed,
    state
  } = lotteryData;

  const timeRemaining = formatTimeRemaining(Number(endTime));
  const stateText = getLotteryStateText(state);
  const stateColor = getLotteryStateColor(state);

  return (
    <div className={`bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 rounded-2xl p-8 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Lottery Round #{roundId?.toString()}
          </h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-xl text-sm font-semibold ${stateColor} backdrop-blur-sm`}>
              {stateText}
            </span>
            {state === 0 && (
              <span className="text-green-400 text-sm font-medium animate-pulse">• Live</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {formatCurrency(formatEther(prizePool))}
          </div>
          <div className="text-gray-300 text-base font-medium">Prize Pool (95%)</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-6 h-6 text-blue-400" />
            <span className="text-gray-300 text-sm font-medium">Time Remaining</span>
          </div>
          <div className="text-white font-bold text-lg">
            {state === 0 ? timeRemaining : 'Ended'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-500/10 border border-green-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 text-green-400" />
            <span className="text-gray-300 text-sm font-medium">Total Tickets</span>
          </div>
          <div className="text-white font-bold text-lg">
            {totalTickets?.toString() || '0'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-yellow-400" />
            <span className="text-gray-300 text-sm font-medium">Ticket Price</span>
          </div>
          <div className="text-white font-bold text-lg">
            {ticketPrice ? formatCurrency(formatEther(ticketPrice)) : formatCurrency(LOTTERY_CONSTANTS.TICKET_PRICE)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-6 h-6 text-purple-400" />
            <span className="text-gray-300 text-sm font-medium">Winner</span>
          </div>
          <div className="text-white font-bold text-lg">
            {winner && winner !== '0x0000000000000000000000000000000000000000' ? (
              <span className="text-green-400">
                {winner.slice(0, 6)}...{winner.slice(-4)}
              </span>
            ) : (
              <span className="text-gray-400">TBD</span>
            )}
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 border border-indigo-500/50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-indigo-400" />
              <div>
                <span className="font-bold text-lg text-indigo-400">Owner Panel</span>
                <p className="text-indigo-300 text-sm">You are the lottery owner</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-400">
                {accumulatedFees ? formatCurrency(formatEther(accumulatedFees)) : formatCurrency('0')}
              </div>
              <div className="text-indigo-300 text-sm">Accumulated Fees (5%)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-indigo-500/30">
            <p className="text-indigo-300 text-sm">
              • You earn 5% of all ticket sales as fees
              • 95% goes to the prize pool
              • Use withdrawFees() to claim your accumulated fees
            </p>
          </div>
        </div>
      )}

      {winner && winner !== '0x0000000000000000000000000000000000000000' && (
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 text-green-400 mb-3">
            <Trophy className="w-6 h-6" />
            <span className="font-bold text-lg">Winner Selected!</span>
          </div>
          <p className="text-green-300 text-base font-medium">
            Winner: {winner}
          </p>
          <p className="text-green-300 text-base font-medium">
            Prize: {formatCurrency(formatEther(prizePool))}
          </p>
          {prizeClaimed && (
            <p className="text-green-400 text-base mt-2 font-semibold">
              ✓ Prize claimed
            </p>
          )}
        </div>
      )}

      {state === 1 && (
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/50 rounded-xl p-6">
          <div className="flex items-center gap-3 text-yellow-400">
            <AlertCircle className="w-6 h-6 animate-pulse" />
            <span className="font-bold text-lg">Calculating Winner...</span>
          </div>
          <p className="text-yellow-300 text-base mt-2">
            The lottery has ended and we're selecting the winner using Chainlink VRF.
            This may take a few minutes.
          </p>
        </div>
      )}

      {state === 0 && Number(endTime) <= currentTime && (
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/50 rounded-xl p-6">
          <div className="flex items-center gap-3 text-orange-400">
            <Clock className="w-6 h-6" />
            <span className="font-bold text-lg">Lottery Ended</span>
          </div>
          <p className="text-orange-300 text-base mt-2">
            The lottery period has ended. Waiting for someone to trigger the winner selection.
          </p>
        </div>
      )}
    </div>
  );
};

export default LotteryStatus;