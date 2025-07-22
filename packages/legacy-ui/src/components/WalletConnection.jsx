import React from 'react';
import { Wallet, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatAddress, formatEther } from '../utils/helpers';

const WalletConnection = ({ 
  wallet, 
  onConnect, 
  onDisconnect, 
  onSwitchNetwork,
  className = "" 
}) => {
  const { 
    account, 
    balance, 
    loading, 
    error, 
    isConnected, 
    isCorrectNetwork,
    isMetaMaskInstalled,
    refreshBalance 
  } = wallet;

  if (!isMetaMaskInstalled) {
    return (
      <div className={`bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/50 rounded-2xl p-6 backdrop-blur-sm ${className}`}>
        <div className="flex items-center gap-2 text-red-400 mb-3">
          <AlertTriangle className="w-6 h-6" />
          <span className="font-semibold">MetaMask not detected</span>
        </div>
        <p className="text-red-300 text-sm mb-4">
          Please install MetaMask to interact with the lottery.
        </p>
        <a 
          href="https://metamask.io/download/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 rounded-2xl p-6 backdrop-blur-sm ${className}`}>
        <div className="text-center">
          <div className="relative mb-4">
            <Wallet className="w-16 h-16 text-blue-400 mx-auto animate-bounce" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
          <p className="text-gray-300 text-sm mb-6">
            Connect your MetaMask wallet to participate in the lottery
          </p>
          <button
            onClick={onConnect}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-blue-800 disabled:to-purple-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect MetaMask
              </>
            )}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 rounded-2xl p-6 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-white font-semibold text-lg">
              {formatAddress(account)}
            </p>
            <p className="text-gray-300 text-sm font-medium">
              {parseFloat(balance).toFixed(4)} ETH
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshBalance}
            className="p-2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
            title="Refresh balance"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onDisconnect}
            className="px-4 py-2 text-sm bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Disconnect
          </button>
        </div>
      </div>

      {!isCorrectNetwork && (
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Wrong Network</span>
          </div>
          <p className="text-yellow-300 text-sm mb-3">
            Please switch to the correct network to participate in the lottery.
          </p>
          <button
            onClick={onSwitchNetwork}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Switch Network
          </button>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletConnection;