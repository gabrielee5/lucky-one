import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import useWalletStore from '../stores/walletStore'
import { LOTTERY_CONFIG } from '../constants'

const ConnectionStatusBar = () => {
  const { isConnected, chainId, switchNetwork } = useWalletStore()
  const targetChainId = LOTTERY_CONFIG.POLYGON_AMOY.chainId
  const isWrongNetwork = isConnected && chainId !== targetChainId

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork(targetChainId)
    } catch (error) {
      console.error('Network switch failed:', error)
    }
  }

  // Show warning for wrong network
  if (isWrongNetwork) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="bg-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-sm font-medium text-yellow-400">
                    Wrong Network Detected
                  </div>
                  <div className="text-xs text-yellow-300">
                    Switch to {LOTTERY_CONFIG.POLYGON_AMOY.name} to continue
                  </div>
                </div>
              </div>
              <motion.button
                onClick={handleSwitchNetwork}
                className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg text-sm font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Switch Network
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Show subtle disconnected state (only if user has interacted)
  if (!isConnected && localStorage.getItem('wallet-attempted')) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="bg-gray-800/50 border-b border-gray-700/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-center gap-2">
              <WifiOff className="w-4 h-4 text-gray-400" />
              <div className="text-sm text-gray-400">
                Wallet disconnected
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}

export default ConnectionStatusBar