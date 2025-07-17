import React from 'react'
import { motion } from 'framer-motion'
import WalletConnectDiscrete from './WalletConnectDiscrete'

const Header = () => {
  return (
    <header className="relative z-[50] px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Top bar with wallet */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Polygon Amoy Testnet
            </div>
          </div>
          <WalletConnectDiscrete />
        </div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent mb-4">
            Decentralized Lottery
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the future of fair gaming with blockchain-powered transparency,
            instant payouts, and provable randomness.
          </p>
        </motion.div>
      </div>
    </header>
  )
}

export default Header