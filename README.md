# Decentralized Lottery DApp

A complete decentralized lottery application built with Solidity, React, and Chainlink VRF for provably fair randomness.

## Features

- **Provably Fair**: Uses Chainlink VRF for secure, verifiable randomness
- **Automatic Rounds**: New lottery rounds start automatically after each winner selection
- **Gas Optimized**: Efficient smart contract design with security best practices
- **Modern UI**: Responsive React frontend with real-time updates
- **Transparent**: All transactions and winners are publicly verifiable on the blockchain

## Architecture

### Smart Contract (`DecentralizedLottery.sol`)
- **Ticket Sales**: Users can purchase 1-100 tickets per transaction at 0.01 ETH each
- **Time-based Rounds**: Each lottery runs for 7 days
- **Winner Selection**: Chainlink VRF ensures fair and random winner selection
- **Prize Distribution**: Winners can claim their prizes manually
- **Security**: Includes reentrancy protection, access controls, and emergency functions

### Frontend (React + Ethers.js)
- **Wallet Integration**: MetaMask connection with network switching
- **Real-time Updates**: Automatic refresh of lottery data every 10 seconds
- **User Dashboard**: Shows ticket counts, win probability, and prize claims
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd lottery-v1
npm install
```

2. **Install frontend dependencies**:
```bash
cd frontend
npm install
cd ..
```

3. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Local Development

1. **Start Hardhat local network**:
```bash
npm run node
```

2. **Deploy contracts** (in a new terminal):
```bash
npm run deploy:local
```

3. **Start frontend** (in a new terminal):
```bash
npm run frontend
```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Connect MetaMask to localhost:8545 (Chain ID: 31337)

## Testing

Run the comprehensive test suite:
```bash
npm test
```

The tests cover:
- Contract deployment and initialization
- Ticket purchasing with various scenarios
- Lottery ending and winner selection
- Prize claiming functionality
- Security measures and access controls

## Deployment

### Testnet Deployment (Sepolia)

1. **Configure environment**:
```bash
# Add to .env file
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
PRIVATE_KEY=0xYOUR-PRIVATE-KEY
VRF_SUBSCRIPTION_ID=YOUR-SUBSCRIPTION-ID
ETHERSCAN_API_KEY=YOUR-ETHERSCAN-API-KEY
```

2. **Deploy to Sepolia**:
```bash
npm run deploy:sepolia
```

3. **Update frontend configuration**:
   - Edit `frontend/src/App.jsx`
   - Set `CONTRACT_ADDRESS` to the deployed contract address
   - Update `CONTRACT_CONFIG` network settings

### Chainlink VRF Setup

1. **Create VRF Subscription**:
   - Visit [Chainlink VRF](https://vrf.chain.link/)
   - Create a new subscription
   - Fund it with LINK tokens

2. **Add Consumer**:
   - Add your deployed contract address as a consumer
   - Update `VRF_SUBSCRIPTION_ID` in environment variables

## Smart Contract Details

### Key Functions

- `buyTickets(uint256 ticketCount)`: Purchase lottery tickets
- `endLottery()`: End current round and request random winner
- `claimPrize(uint256 roundId)`: Winner claims their prize
- `getLotteryRound(uint256 roundId)`: Get round information
- `getPlayerTickets(address player, uint256 roundId)`: Get user's tickets

### Events

- `TicketsPurchased`: Emitted when tickets are bought
- `LotteryEnded`: Emitted when lottery ends
- `WinnerSelected`: Emitted when winner is chosen
- `PrizeClaimed`: Emitted when prize is claimed

### Security Features

- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Access Control**: Owner-only functions for emergency scenarios
- **Input Validation**: Comprehensive parameter checking
- **Safe Math**: Uses Solidity 0.8+ built-in overflow protection

## Frontend Components

### Key Components

- **WalletConnection**: Handles MetaMask connection and network switching
- **LotteryStatus**: Displays current lottery information and countdown
- **TicketPurchase**: Interface for buying tickets with probability calculations
- **WinnerDisplay**: Shows past winners and handles prize claiming

### State Management

- **useWallet**: Custom hook for wallet connection and network management
- **useContract**: Custom hook for smart contract interactions
- **Real-time Updates**: Automatic data refresh and event listening

## Configuration

### Network Settings

Update `frontend/src/utils/contractABI.js` to configure networks:

```javascript
NETWORKS: {
  localhost: {
    chainId: 31337,
    name: "localhost",
    rpcUrl: "http://127.0.0.1:8545"
  },
  sepolia: {
    chainId: 11155111,
    name: "sepolia",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
  }
}
```

## Troubleshooting

### Common Issues

1. **MetaMask Connection Issues**:
   - Ensure MetaMask is installed and unlocked
   - Check network configuration
   - Try refreshing the page

2. **Transaction Failures**:
   - Check account balance for gas fees
   - Verify correct network selection
   - Ensure lottery is still open

3. **Contract Interaction Errors**:
   - Verify contract address is correct
   - Check if contract is deployed on current network
   - Confirm ABI is up to date

### Development Tips

- Use `npm run node` for local development
- Check browser console for detailed error messages
- Use block explorer to verify transactions
- Test with small amounts first

## Security Considerations

⚠️ **Important Security Notes**:

- This is a demonstration project - audit before mainnet deployment
- Always verify contract addresses before interacting
- Never share private keys or seed phrases
- Understand the risks of smart contract interactions
- Consider gas costs and transaction fees

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Open an issue on GitHub
- Review the code comments and documentation

---

**Disclaimer**: This is a demonstration project. Use at your own risk. Always perform proper due diligence and security audits before deploying to mainnet.