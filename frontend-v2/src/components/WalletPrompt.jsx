import React from 'react'
import { motion } from 'framer-motion'
import { Wallet, Shield, Zap, Lock } from 'lucide-react'
import useWalletStore from '../stores/walletStore'

const WalletPrompt = () => {
  const { isConnected } = useWalletStore()

  if (isConnected) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 max-w-4xl mx-auto mb-8"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-gradient-to-br from-primary-600/20 to-violet-600/20 border border-primary-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20"
        >
          <Wallet className="w-8 h-8 text-primary-400" />
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-3">Connect to Get Started</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Connect your wallet to participate in our transparent, decentralized lottery.
          Your connection is secure and you remain in full control.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-green-500/20">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold mb-1">Secure</h3>
            <p className="text-sm text-gray-400 text-center">
              Your keys, your control
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600/20 to-violet-600/20 border border-primary-500/30 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-purple-500/20">
              <Zap className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="font-semibold mb-1">Instant</h3>
            <p className="text-sm text-gray-400 text-center">
              Quick connection process
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-yellow-500/20">
              <Lock className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="font-semibold mb-1">Private</h3>
            <p className="text-sm text-gray-400 text-center">
              No personal data required
            </p>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          Use the wallet connection button in the top right corner to get started
        </p>
      </div>
    </motion.div>
  )
}

export default WalletPrompt