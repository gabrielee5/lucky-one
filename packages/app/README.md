# Decentralized Lottery Frontend v2

A modern, responsive frontend for the decentralized lottery application built with React, Vite, and Tailwind CSS.

## Features

### 🎯 Core Functionality
- **Flawless MetaMask Integration**: Seamless wallet connection and network switching
- **Live Lottery Monitoring**: Real-time updates of lottery status and statistics
- **Ticket Purchase**: Intuitive interface for buying lottery tickets
- **Prize Claims**: Automatic detection and claiming of winnings
- **Lottery History**: Complete history of previous rounds and winners

### 🎨 Enhanced UX/UI
- **Modern Design**: Beautiful gradient backgrounds and glass-morphism effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion animations for enhanced user experience
- **Real-time Feedback**: Toast notifications for all user actions
- **Loading States**: Proper loading indicators throughout the application

### 🔧 Technical Features
- **React Query**: Smart caching and data synchronization
- **Zustand**: Lightweight state management
- **TypeScript Ready**: Easy migration to TypeScript
- **Optimized Performance**: Lazy loading and code splitting
- **Error Boundaries**: Graceful error handling

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MetaMask browser extension
- Access to Polygon Amoy testnet

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Configuration

The application is configured to work with:
- **Network**: Polygon Amoy Testnet
- **Contract Address**: `0x3a9518aD2774b3a7138EcC2a3a622Dc41d0367EA`
- **Chain ID**: 80002

To update the configuration, modify the values in `src/constants/index.js`.

## Project Structure

```
src/
├── components/          # React components
│   ├── WalletConnect.jsx    # Wallet connection component
│   ├── LotteryStatus.jsx    # Live lottery status display
│   ├── TicketPurchase.jsx   # Ticket purchasing interface
│   ├── PrizeClaim.jsx       # Prize claiming component
│   ├── LotteryHistory.jsx   # Historical lottery data
│   ├── NetworkStatus.jsx    # Network connection status
│   └── Footer.jsx           # Application footer
├── hooks/               # Custom React hooks
│   ├── useContract.js       # Contract interaction hooks
│   └── useLottery.js        # Lottery-specific hooks
├── stores/              # State management
│   └── walletStore.js       # Wallet state management
├── utils/               # Utility functions
│   └── formatters.js        # Data formatting utilities
├── constants/           # Application constants
│   └── index.js             # Contract ABI and configuration
├── App.jsx              # Main application component
├── main.jsx             # Application entry point
└── index.css            # Global styles
```

## Usage Guide

### Connecting Your Wallet

1. Click "Connect MetaMask" button
2. Approve the connection in MetaMask
3. If prompted, switch to Polygon Amoy testnet
4. Your wallet is now connected and ready to use

### Buying Tickets

1. Ensure your wallet is connected
2. Select the number of tickets (1-100)
3. Review the total cost in MATIC
4. Click "Buy Tickets" and confirm the transaction
5. Wait for confirmation and your tickets will be added

### Claiming Prizes

1. If you win a lottery, the prize claim section will appear automatically
2. Click "Claim Your Prize" 
3. Confirm the transaction in MetaMask
4. Your winnings will be transferred to your wallet

### Monitoring Lottery Status

The application provides real-time updates on:
- Current lottery round information
- Time remaining until draw
- Prize pool amount
- Total tickets sold
- Number of participants
- Your tickets and win probability

## Smart Contract Integration

The frontend interacts with the LuckyOne smart contract deployed on Polygon Amoy testnet:

- **Lottery Duration**: 7 days per round
- **Ticket Price**: 0.01 MATIC
- **Maximum Tickets**: 100 per purchase
- **Randomness**: Chainlink VRF for provable fairness
- **Owner Fee**: 5% of ticket sales

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (when configured)

### Key Dependencies

- **React 18**: Latest React with concurrent features
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Ethers.js**: Ethereum library for blockchain interaction
- **React Query**: Data fetching and caching
- **Zustand**: State management
- **React Hot Toast**: Toast notifications

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_ENVIRONMENT=development
VITE_ENABLE_ANALYTICS=false
```

## Troubleshooting

### Common Issues

1. **MetaMask not detected**:
   - Ensure MetaMask extension is installed and enabled
   - Refresh the page after installing MetaMask

2. **Wrong network error**:
   - The app will prompt you to switch networks
   - Click "Switch Network" and approve in MetaMask

3. **Transaction failed**:
   - Check if you have sufficient MATIC balance
   - Ensure the lottery is in "Open" state
   - Try increasing gas limit in MetaMask

4. **Slow loading**:
   - Check your internet connection
   - Polygon Amoy testnet might be experiencing delays

### Getting Test MATIC

To get test MATIC for Polygon Amoy:
1. Visit the [Polygon Amoy Faucet](https://faucet.polygon.technology/)
2. Connect your wallet
3. Request test MATIC tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the smart contract documentation
- Contact the development team