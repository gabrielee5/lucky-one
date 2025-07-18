import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, ChevronDown, AlertCircle, Loader2, Copy, ExternalLink, LogOut } from 'lucide-react'
import useWalletStore from '../stores/walletStore'
import { LOTTERY_CONFIG } from '../constants'
import { formatAddress, formatEther, getExplorerUrl } from '../utils/formatters'

const WalletConnectDiscrete = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)
  
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
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Network switch failed:', error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsDropdownOpen(false)
  }

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setShowCopyFeedback(true)
      setTimeout(() => setShowCopyFeedback(false), 2000)
    }
  }

  const getStatusColor = () => {
    if (!isConnected) return 'text-gray-400'
    if (isWrongNetwork) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusDot = () => {
    if (!isConnected) return 'bg-gray-500'
    if (isWrongNetwork) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Not connected state - compact button
  if (!isConnected) {
    return (
      <div className="relative">
        <motion.button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600/20 to-violet-600/20 hover:from-primary-600/30 hover:to-violet-600/30 border border-primary-500/30 rounded-lg transition-all duration-200 text-primary-300 hover:text-primary-200 glow-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isConnecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isConnecting ? 'Connecting...' : 'Connect'}
          </span>
        </motion.button>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 left-0 right-0 z-[60] bg-red-500/20 border border-red-500/30 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Connected state - discrete status with dropdown
  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-800/50 to-purple-800/30 hover:from-gray-800/70 hover:to-purple-800/50 border border-purple-500/30 rounded-lg transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
          <Wallet className={`w-4 h-4 ${getStatusColor()}`} />
          <span className="text-sm font-medium text-gray-300">
            {formatAddress(address)}
          </span>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 right-0 z-[60] w-72 bg-gradient-to-br from-gray-800/95 to-purple-900/95 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWrongNetwork ? 'bg-yellow-600' : 'bg-primary-600'}`}>
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-200">
                    {formatAddress(address)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatEther(balance, 4)} POL
                  </div>
                </div>
              </div>
            </div>

            {/* Network status */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-300">Network</div>
                  <div className={`text-sm ${isWrongNetwork ? 'text-yellow-400' : 'text-green-400'}`}>
                    {isWrongNetwork ? 'Wrong Network' : LOTTERY_CONFIG.POLYGON_AMOY.name}
                  </div>
                </div>
                {isWrongNetwork && (
                  <motion.button
                    onClick={handleSwitchNetwork}
                    className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Switch
                  </motion.button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <motion.button
                onClick={handleCopyAddress}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">
                  {showCopyFeedback ? 'Copied!' : 'Copy Address'}
                </span>
              </motion.button>

              <motion.a
                href={getExplorerUrl(address, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">View on Explorer</span>
              </motion.a>

              <motion.button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-600/20 rounded-lg transition-colors text-red-400"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Disconnect</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-[55]" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}

export default WalletConnectDiscrete