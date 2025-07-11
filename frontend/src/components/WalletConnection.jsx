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
      <div className={`bg-red-900/20 border border-red-500 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>MetaMask not detected</span>
        </div>
        <p className="text-red-300 text-sm mt-2">
          Please install MetaMask to interact with the lottery.
        </p>
        <a 
          href="https://metamask.io/download/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
          <p className="text-gray-400 text-sm mb-4">
            Connect your MetaMask wallet to participate in the lottery
          </p>
          <button
            onClick={onConnect}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Connect MetaMask
              </>
            )}
          </button>
          {error && (
            <div className="mt-3 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-medium">
              {formatAddress(account)}
            </p>
            <p className="text-gray-400 text-sm">
              {parseFloat(balance).toFixed(4)} ETH
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshBalance}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Refresh balance"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onDisconnect}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {!isCorrectNetwork && (
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Wrong Network</span>
          </div>
          <p className="text-yellow-300 text-sm mb-3">
            Please switch to the correct network to participate in the lottery.
          </p>
          <button
            onClick={onSwitchNetwork}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
          >
            Switch Network
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletConnection;