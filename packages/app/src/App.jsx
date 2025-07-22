import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import ConnectionStatusBar from './components/ConnectionStatusBar'
import WalletPrompt from './components/WalletPrompt'
import LotteryStatus from './components/LotteryStatus'
import TicketPurchase from './components/TicketPurchase'
import PrizeClaim from './components/PrizeClaim'
import LotteryHistory from './components/LotteryHistory'
import InfoPage from './components/InfoPage'
import Footer from './components/Footer'
import useWalletStore from './stores/walletStore'

const App = () => {
  const { isConnected } = useWalletStore()
  const [currentPage, setCurrentPage] = useState('home')
  const [infoSection, setInfoSection] = useState('how-it-works')

  const renderMainContent = () => {
    switch (currentPage) {
      case 'info':
        return <InfoPage 
          initialSection={infoSection} 
          onBackToHome={() => setCurrentPage('home')}
        />
      case 'home':
      default:
        return (
          <>
            {/* Prize Claim (only shows if user is winner) */}
            <PrizeClaim />

            {/* Main Dashboard */}
            {isConnected ? (
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
            ) : (
              <div className="max-w-4xl mx-auto">
                <LotteryStatus />
              </div>
            )}

            {/* Wallet connection prompt */}
            <WalletPrompt />

            {/* History */}
            <div className="max-w-4xl mx-auto">
              <LotteryHistory />
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-800">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c084fc' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Connection Status Bar */}
      <ConnectionStatusBar />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {renderMainContent()}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <Footer 
        onNavigateToInfo={(section) => {
          setInfoSection(section)
          setCurrentPage('info')
        }}
      />
    </div>
  )
}

export default App