import React from 'react';
import { Clock, Users, DollarSign, Trophy, AlertCircle } from 'lucide-react';
import { formatEther, formatTimeRemaining, getLotteryStateText, getLotteryStateColor } from '../utils/helpers';

const LotteryStatus = ({ 
  lotteryData, 
  ticketPrice, 
  loading, 
  error, 
  currentTime,
  className = "" 
}) => {
  if (loading) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-500 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading lottery data</span>
        </div>
        <p className="text-red-300 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!lotteryData) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No lottery data available</p>
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
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Lottery Round #{roundId?.toString()}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-sm font-medium ${stateColor} bg-gray-700`}>
              {stateText}
            </span>
            {state === 0 && (
              <span className="text-green-400 text-sm">• Live</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">
            {formatEther(prizePool)} ETH
          </div>
          <div className="text-gray-400 text-sm">Prize Pool</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 text-sm">Time Remaining</span>
          </div>
          <div className="text-white font-semibold">
            {state === 0 ? timeRemaining : 'Ended'}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">Total Tickets</span>
          </div>
          <div className="text-white font-semibold">
            {totalTickets?.toString() || '0'}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 text-sm">Ticket Price</span>
          </div>
          <div className="text-white font-semibold">
            {ticketPrice ? formatEther(ticketPrice) : '0.01'} ETH
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300 text-sm">Winner</span>
          </div>
          <div className="text-white font-semibold">
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

      {winner && winner !== '0x0000000000000000000000000000000000000000' && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">Winner Selected!</span>
          </div>
          <p className="text-green-300 text-sm">
            Winner: {winner}
          </p>
          <p className="text-green-300 text-sm">
            Prize: {formatEther(prizePool)} ETH
          </p>
          {prizeClaimed && (
            <p className="text-green-400 text-sm mt-1">
              ✓ Prize claimed
            </p>
          )}
        </div>
      )}

      {state === 1 && (
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-5 h-5 animate-pulse" />
            <span className="font-medium">Calculating Winner...</span>
          </div>
          <p className="text-yellow-300 text-sm mt-1">
            The lottery has ended and we're selecting the winner using Chainlink VRF.
            This may take a few minutes.
          </p>
        </div>
      )}

      {state === 0 && Number(endTime) <= currentTime && (
        <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-400">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Lottery Ended</span>
          </div>
          <p className="text-orange-300 text-sm mt-1">
            The lottery period has ended. Waiting for someone to trigger the winner selection.
          </p>
        </div>
      )}
    </div>
  );
};

export default LotteryStatus;