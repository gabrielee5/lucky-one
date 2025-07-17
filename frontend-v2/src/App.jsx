import React from 'react'
import { motion } from 'framer-motion'
import WalletConnect from './components/WalletConnect'
import LotteryStatus from './components/LotteryStatus'
import TicketPurchase from './components/TicketPurchase'
import PrizeClaim from './components/PrizeClaim'
import LotteryHistory from './components/LotteryHistory'
import NetworkStatus from './components/NetworkStatus'
import Footer from './components/Footer'
import useWalletStore from './stores/walletStore'

const App = () => {
  const { isConnected } = useWalletStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent mb-4">
              Decentralized Lottery
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the future of fair gaming with blockchain-powered transparency,
              instant payouts, and provable randomness.
            </p>
          </motion.div>

          {/* Network Status */}
          <div className="mb-6">
            <NetworkStatus />
          </div>

          {/* Wallet Connection */}
          <div className="mb-8">
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Prize Claim (only shows if user is winner) */}
              <PrizeClaim />

              {/* Main Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Lottery Status */}
                <div className="lg:col-span-2 space-y-6">
                  <LotteryStatus />
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                  <TicketPurchase />
                </div>
              </div>

              {/* History */}
              <div className="max-w-4xl mx-auto">
                <LotteryHistory />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12"
            >
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Welcome to the Future of Lottery</h2>
                <p className="text-gray-400 mb-8">
                  Connect your wallet to participate in our decentralized lottery.
                  Every draw is transparent, fair, and powered by Chainlink VRF for
                  true randomness.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="glass-card p-6">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Transparent</h3>
                    <p className="text-sm text-gray-400">
                      All lottery operations are on-chain and verifiable
                    </p>
                  </div>

                  <div className="glass-card p-6">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Instant</h3>
                    <p className="text-sm text-gray-400">
                      Winners can claim prizes immediately after the draw
                    </p>
                  </div>

                  <div className="glass-card p-6">
                    <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Secure</h3>
                    <p className="text-sm text-gray-400">
                      Protected by blockchain technology and smart contracts
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App