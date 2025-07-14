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
      <div className={`bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 rounded-2xl p-8 backdrop-blur-sm ${className}`}>
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No Past Winners Yet</h3>
          <p className="text-gray-400 text-base font-medium">
            Be the first to win the lottery!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 rounded-2xl p-8 backdrop-blur-sm ${className}`}>
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-yellow-400" />
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Winners & Prizes</h3>
      </div>

      {userWinnings.length > 0 && (
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/50 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 text-green-400 mb-4">
            <Gift className="w-6 h-6" />
            <span className="font-bold text-lg">You Have Unclaimed Prizes!</span>
          </div>
          <div className="space-y-3 mb-6">
            {userWinnings.map((winner, index) => (
              <div key={index} className="flex justify-between items-center text-base">
                <span className="text-green-300 font-medium">
                  Round #{winner.roundId?.toString()}
                </span>
                <span className="text-green-300 font-bold">
                  {formatEther(winner.prizePool)} ETH
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mb-6 pt-4 border-t border-green-500">
            <span className="text-green-300 font-semibold text-lg">Total Claimable:</span>
            <span className="text-green-300 font-bold text-xl">
              {claimablePrize.toFixed(4)} ETH
            </span>
          </div>
          <button
            onClick={() => onClaimPrize(userWinnings[0].roundId)}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-green-800 disabled:to-emerald-800 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Claiming...
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                Claim Prize
              </>
            )}
          </button>
          {error && (
            <div className="mt-4 bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/50 rounded-xl p-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">{error}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-xl font-bold text-white">Recent Winners</h4>
        <div className="max-h-80 overflow-y-auto space-y-4">
          {pastWinners.slice(0, 10).map((winner, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-700/50 to-slate-600/30 border border-slate-600/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">
                      Round #{winner.roundId?.toString()}
                    </p>
                    <p className="text-gray-400 text-sm font-medium">
                      {formatAddress(winner.winner)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">
                    {formatEther(winner.prizePool)} ETH
                  </p>
                  <p className="text-gray-400 text-sm">
                    {winner.prizeClaimed ? (
                      <span className="flex items-center gap-1 text-green-400 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Claimed
                      </span>
                    ) : (
                      <span className="text-yellow-400 font-medium">Unclaimed</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span className="font-medium">Total Tickets: {winner.totalTickets?.toString()}</span>
                <span>
                  {winner.winner.toLowerCase() === userAddress?.toLowerCase() && (
                    <span className="text-green-400 font-bold">You Won!</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-600/50">
        <div className="text-sm text-gray-400 space-y-2">
          <p className="font-medium">• Winners are selected using Chainlink VRF for fairness</p>
          <p className="font-medium">• Prize must be claimed manually by the winner</p>
          <p className="font-medium">• All transactions are transparent on the blockchain</p>
        </div>
      </div>
    </div>
  );
};

export default WinnerDisplay;