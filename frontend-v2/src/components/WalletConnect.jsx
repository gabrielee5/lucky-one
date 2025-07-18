import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, AlertCircle, Loader2 } from 'lucide-react'
import useWalletStore from '../stores/walletStore'
import { LOTTERY_CONFIG } from '../constants'
import { formatAddress, formatEther } from '../utils/formatters'

const WalletConnect = () => {
  const {
    isConnected,
    address,
    balance,
    chainId,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
    initialize,
    setupEventListeners
  } = useWalletStore()

  const targetChainId = LOTTERY_CONFIG.POLYGON_AMOY.chainId
  const isWrongNetwork = isConnected && chainId !== targetChainId

  useEffect(() => {
    initialize()
    setupEventListeners()
  }, [initialize, setupEventListeners])

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork(targetChainId)
    } catch (error) {
      console.error('Network switch failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="glass-card p-6 max-w-md mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Wallet className="w-16 h-16 mx-auto mb-4 text-primary-400" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your MetaMask wallet to participate in the lottery
          </p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <motion.button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 glow-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isConnecting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              'Connect MetaMask'
            )}
          </motion.button>
        </div>
      </div>
    )
  }

  if (isWrongNetwork) {
    return (
      <div className="glass-card p-6 max-w-md mx-auto">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold mb-2">Wrong Network</h2>
          <p className="text-gray-400 mb-6">
            Please switch to {LOTTERY_CONFIG.POLYGON_AMOY.name} to continue
          </p>
          
          <motion.button
            onClick={handleSwitchNetwork}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 glow-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Switch Network
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold">{formatAddress(address)}</div>
            <div className="text-sm text-gray-400">
              {formatEther(balance, 4)} POL
            </div>
          </div>
        </div>
        
        <motion.button
          onClick={disconnect}
          className="px-4 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Disconnect
        </motion.button>
      </div>
    </div>
  )
}

export default WalletConnect