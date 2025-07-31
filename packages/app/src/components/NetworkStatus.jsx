import React from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react'
import { LOTTERY_CONFIG } from '../constants'
import useWalletStore from '../stores/walletStore'

const NetworkStatus = () => {
  const { isConnected, chainId } = useWalletStore()
  const targetChainId = LOTTERY_CONFIG.POLYGON.chainId
  const isCorrectNetwork = chainId === targetChainId

  if (!isConnected) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-gray-400" />
          <div>
            <div className="font-medium text-gray-400">Not Connected</div>
            <div className="text-sm text-gray-500">Connect wallet to view network status</div>
          </div>
        </div>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 border-yellow-500/30 bg-yellow-500/10"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <div>
            <div className="font-medium text-yellow-500">Wrong Network</div>
            <div className="text-sm text-yellow-400">
              Switch to {LOTTERY_CONFIG.POLYGON.name}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 border-green-500/30 bg-green-500/10"
    >
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <div>
          <div className="font-medium text-green-500">Connected</div>
          <div className="text-sm text-green-400">
            {LOTTERY_CONFIG.POLYGON.name}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default NetworkStatus