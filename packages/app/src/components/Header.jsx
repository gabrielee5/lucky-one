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
              Polygon Mainnet
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
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mb-4 text-glow">
            Lucky One
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Transparent odds, massive potential.
          </p>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            More players = bigger jackpots.
          </p>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Feeling lucky?
          </p>
        </motion.div>
      </div>
    </header>
  )
}

export default Header