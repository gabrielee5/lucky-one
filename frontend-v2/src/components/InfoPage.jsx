import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HelpCircle, 
  Shield, 
  BookOpen, 
  MessageCircle, 
  CheckCircle,
  Clock,
  Users,
  Trophy,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ChevronRight
} from 'lucide-react'

const InfoPage = ({ initialSection = 'how-it-works', onBackToHome }) => {
  const [activeSection, setActiveSection] = useState(initialSection)

  const menuItems = [
    {
      id: 'how-it-works',
      title: 'How It Works',
      icon: BookOpen,
      description: 'Learn about our lottery system'
    },
    {
      id: 'fair-play',
      title: 'Fair Play',
      icon: Shield,
      description: 'Provably fair and transparent'
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: HelpCircle,
      description: 'Frequently asked questions'
    },
    {
      id: 'support',
      title: 'Support',
      icon: MessageCircle,
      description: 'Get help and support'
    }
  ]

  const content = {
    'how-it-works': {
      title: 'How It Works',
      sections: [
        {
          title: 'Getting Started',
          content: `
            <p>Welcome to our decentralized lottery! Here's how to participate:</p>
            <ol>
              <li><strong>Connect Your Wallet:</strong> Use MetaMask or another Web3 wallet to connect to the Polygon Amoy testnet.</li>
              <li><strong>Get Test POL:</strong> Visit the Polygon faucet to get free testnet tokens.</li>
              <li><strong>Buy Tickets:</strong> Purchase lottery tickets using POL tokens.</li>
              <li><strong>Wait for Draw:</strong> Each lottery round runs for a set duration.</li>
              <li><strong>Check Results:</strong> Winners are selected using Chainlink VRF for guaranteed fairness.</li>
            </ol>
          `
        },
        {
          title: 'Lottery Mechanics',
          content: `
            <p>Our lottery system operates on a simple but secure mechanism:</p>
            <ul>
              <li><strong>Ticket Price:</strong> Fixed price per ticket in POL</li>
              <li><strong>Draw Frequency:</strong> Regular draws with predetermined timing</li>
              <li><strong>Prize Pool:</strong> Accumulated from all ticket sales</li>
              <li><strong>Winner Selection:</strong> Completely random using Chainlink VRF</li>
              <li><strong>Automatic Payouts:</strong> Winners receive prizes automatically</li>
            </ul>
          `
        },
        {
          title: 'Smart Contract Features',
          content: `
            <p>Our smart contract ensures complete transparency and security:</p>
            <ul>
              <li><strong>Immutable Code:</strong> Contract logic cannot be changed</li>
              <li><strong>Public Verification:</strong> All transactions are on-chain</li>
              <li><strong>Automatic Execution:</strong> No human intervention needed</li>
              <li><strong>Emergency Safeguards:</strong> Built-in safety mechanisms</li>
            </ul>
          `
        }
      ]
    },
    'fair-play': {
      title: 'Fair Play & Transparency',
      sections: [
        {
          title: 'Provably Fair System',
          content: `
            <p>Our lottery uses cutting-edge technology to ensure complete fairness:</p>
            <ul>
              <li><strong>Chainlink VRF:</strong> Cryptographically secure random number generation</li>
              <li><strong>On-Chain Verification:</strong> All randomness is verifiable on the blockchain</li>
              <li><strong>No Manipulation:</strong> Impossible for anyone to predict or influence outcomes</li>
              <li><strong>Transparent Process:</strong> Every draw is publicly auditable</li>
            </ul>
          `
        },
        {
          title: 'Chainlink VRF Integration',
          content: `
            <p>We use Chainlink VRF (Verifiable Random Function) for winner selection:</p>
            <ul>
              <li><strong>Cryptographic Proof:</strong> Each random number comes with a proof</li>
              <li><strong>Tamper-Proof:</strong> Cannot be manipulated by anyone</li>
              <li><strong>Instant Verification:</strong> Anyone can verify the randomness</li>
              <li><strong>Industry Standard:</strong> Used by major DeFi protocols</li>
            </ul>
          `
        },
        {
          title: 'How VRF Randomness Works',
          content: `
            <p>Understanding the technical details of our random number generation:</p>
            <div class="space-y-4">
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Random Number Generation</h4>
                <p>The VRF generates a single random number (uint256) with an astronomical range from 0 to 2^256 - 1. That's approximately 115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457,584,007,913,129,639,935 possible values!</p>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Winner Selection Process</h4>
                <p>Here's exactly how your lottery ticket becomes a winner:</p>
                <ol>
                  <li><strong>VRF Returns:</strong> For example, the random number might be 87,392,847,592,847,592,847,592,847,592,847</li>
                  <li><strong>Modulo Operation:</strong> We calculate <code>randomNumber % totalTickets</code></li>
                  <li><strong>If 100 tickets sold:</strong> 87,392,847,592,847,592,847,592,847,592,847 % 100 = 47</li>
                  <li><strong>Ticket #47 wins!</strong> The contract finds who owns ticket #47</li>
                </ol>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Perfect Fairness</h4>
                <p>Each ticket has exactly equal probability of winning:</p>
                <ul>
                  <li>With 100 tickets sold: each ticket has exactly 1/100 = 1% chance</li>
                  <li>With 1,000 tickets sold: each ticket has exactly 1/1,000 = 0.1% chance</li>
                  <li>More tickets = proportionally higher chance of winning</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Example Scenario</h4>
                <p>If Alice bought 3 tickets, Bob bought 2 tickets, and Charlie bought 1 ticket:</p>
                <ul>
                  <li>Alice owns tickets 0, 1, 2 (50% chance to win)</li>
                  <li>Bob owns tickets 3, 4 (33.3% chance to win)</li>
                  <li>Charlie owns ticket 5 (16.7% chance to win)</li>
                </ul>
                <p>If the winning ticket number is 4, Bob wins! The system automatically finds who owns that ticket.</p>
              </div>
            </div>
          `
        },
        {
          title: 'Smart Contract Security',
          content: `
            <p>Our smart contract implements multiple security measures:</p>
            <ul>
              <li><strong>Reentrancy Protection:</strong> Prevents common attack vectors</li>
              <li><strong>Access Controls:</strong> Limited administrative functions</li>
              <li><strong>Emergency Pausing:</strong> Can pause in case of issues</li>
              <li><strong>Verified Contract:</strong> Source code is publicly verified on PolygonScan</li>
            </ul>
          `
        }
      ]
    },
    'faq': {
      title: 'Frequently Asked Questions',
      sections: [
        {
          title: 'General Questions',
          content: `
            <div class="space-y-4">
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: How do I participate?</h4>
                <p>Connect your wallet, get test POL from the faucet, and buy tickets. It's that simple!</p>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: When are the draws?</h4>
                <p>Draws happen automatically when the timer expires. Check the main page for the next draw time.</p>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: How are winners selected?</h4>
                <p>Winners are selected using Chainlink VRF, ensuring complete fairness and transparency.</p>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: Is this real money?</h4>
                <p>No, this is a testnet demonstration. All tokens are for testing purposes only.</p>
              </div>
            </div>
          `
        },
        {
          title: 'Technical Questions',
          content: `
            <div class="space-y-4">
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: What network is this on?</h4>
                <p>This lottery runs on Polygon Amoy testnet. Make sure your wallet is connected to the right network.</p>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: Can I view the smart contract?</h4>
                <p>Yes! The contract is verified on PolygonScan. Check the footer for the contract address.</p>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: Is the code open source?</h4>
                <p>Yes, the entire project is open source and available for review and contribution.</p>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: How do I get test POL?</h4>
                <p>Visit the official Polygon faucet at faucet.polygon.technology to get free testnet tokens.</p>
              </div>
            </div>
          `
        },
        {
          title: 'Troubleshooting',
          content: `
            <div class="space-y-4">
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: My wallet won't connect</h4>
                <p>Make sure you're on the Polygon Amoy testnet and have a compatible wallet like MetaMask.</p>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: Transaction failed</h4>
                <p>Check that you have enough POL for gas fees and that you're on the correct network.</p>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: I can't see my tickets</h4>
                <p>Make sure you're connected with the same wallet you used to buy tickets. Refresh the page if needed.</p>
              </div>
              <div>
                <h4 class="font-semibold text-primary-400 mb-2">Q: When will I receive my prize?</h4>
                <p>Prizes are automatically distributed when you win. Check your wallet for incoming transactions.</p>
              </div>
            </div>
          `
        }
      ]
    },
    'support': {
      title: 'Support & Contact',
      sections: [
        {
          title: 'Getting Help',
          content: `
            <p>Need assistance? Here are the best ways to get help:</p>
            <ul>
              <li><strong>Documentation:</strong> Check our comprehensive guides and tutorials</li>
              <li><strong>Community:</strong> Join our community discussions for peer support</li>
              <li><strong>GitHub Issues:</strong> Report bugs or request features</li>
              <li><strong>Direct Contact:</strong> Reach out through our official channels</li>
            </ul>
          `
        },
        {
          title: 'Community Resources',
          content: `
            <p>Connect with other users and get community support:</p>
            <ul>
              <li><strong>Discord Server:</strong> Real-time chat and support</li>
              <li><strong>Telegram Group:</strong> Community discussions and announcements</li>
              <li><strong>Twitter:</strong> Follow for updates and news</li>
              <li><strong>Reddit:</strong> Community-driven support and discussions</li>
            </ul>
          `
        },
        {
          title: 'Report Issues',
          content: `
            <p>Found a bug or have a suggestion? Here's how to report it:</p>
            <ul>
              <li><strong>GitHub Issues:</strong> Technical bugs and feature requests</li>
              <li><strong>Security Issues:</strong> Report security vulnerabilities privately</li>
              <li><strong>General Feedback:</strong> Share your thoughts and suggestions</li>
              <li><strong>Documentation Issues:</strong> Help us improve our guides</li>
            </ul>
          `
        }
      ]
    }
  }

  const renderContent = (htmlContent) => {
    return { __html: htmlContent }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back to Home Button */}
      {onBackToHome && (
        <div className="mb-8">
          <motion.button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </motion.button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-6">Information</h3>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-400">{item.description}</div>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </div>
                  </motion.button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8"
          >
            <h1 className="text-3xl font-bold mb-8">{content[activeSection].title}</h1>
            
            <div className="space-y-8">
              {content[activeSection].sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="prose prose-invert max-w-none"
                >
                  <h2 className="text-xl font-semibold mb-4 text-primary-400">{section.title}</h2>
                  <div 
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={renderContent(section.content)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default InfoPage