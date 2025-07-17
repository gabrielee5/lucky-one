import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Shield, Code, Heart } from 'lucide-react'
import { LOTTERY_CONFIG } from '../constants'

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary-400">Decentralized Lottery</h3>
            <p className="text-sm text-gray-400">
              Fair, transparent, and secure lottery powered by blockchain technology.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-300">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Fair Play
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Technical */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-300">Technical</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href={`${LOTTERY_CONFIG.POLYGON_AMOY.blockExplorer}/address/${LOTTERY_CONFIG.POLYGON_AMOY.lotteryAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-1"
                >
                  Smart Contract <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://docs.chain.link/vrf/v2/introduction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-1"
                >
                  Chainlink VRF <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://polygon.technology/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-1"
                >
                  Polygon Network <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-300">Security</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">Audited Smart Contract</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Code className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">Open Source</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">Chainlink VRF</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              © 2024 Decentralized Lottery. All rights reserved.
            </div>
            <motion.div 
              className="flex items-center gap-1 text-sm text-gray-400 mt-4 md:mt-0"
              whileHover={{ scale: 1.05 }}
            >
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400" />
              <span>for the decentralized future</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer