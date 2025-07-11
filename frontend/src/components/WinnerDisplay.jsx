import React from 'react';
import { Trophy, Gift, CheckCircle, AlertCircle } from 'lucide-react';
import { formatEther, formatAddress } from '../utils/helpers';

const WinnerDisplay = ({ 
  pastWinners, 
  userAddress, 
  onClaimPrize, 
  loading, 
  error,
  className = "" 
}) => {
  const userWinnings = pastWinners.filter(winner => 
    winner.winner.toLowerCase() === userAddress?.toLowerCase() && !winner.prizeClaimed
  );

  const claimablePrize = userWinnings.reduce((total, winner) => 
    total + parseFloat(formatEther(winner.prizePool)), 0
  );

  if (!pastWinners.length) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">No Past Winners Yet</h3>
          <p className="text-gray-400 text-sm">
            Be the first to win the lottery!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-white">Winners & Prizes</h3>
      </div>

      {userWinnings.length > 0 && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-400 mb-3">
            <Gift className="w-5 h-5" />
            <span className="font-medium">You Have Unclaimed Prizes!</span>
          </div>
          <div className="space-y-2 mb-4">
            {userWinnings.map((winner, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-green-300">
                  Round #{winner.roundId?.toString()}
                </span>
                <span className="text-green-300 font-medium">
                  {formatEther(winner.prizePool)} ETH
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mb-4 pt-2 border-t border-green-500">
            <span className="text-green-300 font-medium">Total Claimable:</span>
            <span className="text-green-300 font-bold text-lg">
              {claimablePrize.toFixed(4)} ETH
            </span>
          </div>
          <button
            onClick={() => onClaimPrize(userWinnings[0].roundId)}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Claiming...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                Claim Prize
              </>
            )}
          </button>
          {error && (
            <div className="mt-3 bg-red-900/20 border border-red-500 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-white">Recent Winners</h4>
        <div className="max-h-64 overflow-y-auto">
          {pastWinners.slice(0, 10).map((winner, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Round #{winner.roundId?.toString()}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {formatAddress(winner.winner)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    {formatEther(winner.prizePool)} ETH
                  </p>
                  <p className="text-gray-400 text-sm">
                    {winner.prizeClaimed ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        Claimed
                      </span>
                    ) : (
                      <span className="text-yellow-400">Unclaimed</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Total Tickets: {winner.totalTickets?.toString()}</span>
                <span>
                  {winner.winner.toLowerCase() === userAddress?.toLowerCase() && (
                    <span className="text-green-400 font-medium">You Won!</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 space-y-1">
          <p>• Winners are selected using Chainlink VRF for fairness</p>
          <p>• Prize must be claimed manually by the winner</p>
          <p>• All transactions are transparent on the blockchain</p>
        </div>
      </div>
    </div>
  );
};

export default WinnerDisplay;