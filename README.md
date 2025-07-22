# Decentralized Lottery - Monorepo

A provably fair decentralized lottery system built with Solidity, Hardhat, and Chainlink VRF v2.

## 📁 Project Structure

```
lottery-v1/
├── packages/
│   ├── contracts/          # Smart contracts and tests
│   │   ├── contracts/      # Solidity source files
│   │   ├── test/          # Contract tests
│   │   ├── artifacts/     # Compiled artifacts (generated)
│   │   └── cache/         # Hardhat cache (generated)
│   │
│   ├── cli/               # Management and deployment tools
│   │   ├── scripts/       # Deployment, testing, and utility scripts
│   │   ├── utils/         # Shared utilities
│   │   └── deployments/   # Network deployment info (generated)
│   │
│   ├── app/               # Primary frontend (React + Vite)
│   │   ├── src/           # React application source
│   │   └── package.json   # App dependencies
│   │
│   └── legacy-ui/         # Original frontend version
│       ├── src/           # Legacy React app
│       └── package.json   # Legacy dependencies
│
├── tools/
│   ├── configs/           # Shared configuration files
│   │   └── hardhat.config.js  # Hardhat configuration
│   └── utils/             # Shared utilities (empty)
│
├── docs/                  # Project documentation
│   ├── README.md          # Original project README
│   ├── TECHNICAL_GUIDE.md # Technical implementation guide
│   └── *.md               # Other documentation files
│
├── package.json           # Root package with workspace scripts
└── hardhat.config.js      # Root hardhat config (references tools/configs/)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- MetaMask or compatible Web3 wallet
- MATIC tokens for testnet deployment

### Installation
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd packages/app && npm install
cd ../legacy-ui && npm install
```

### Environment Setup
```bash
# Copy and fill environment variables
cp .env.example .env
```

Required environment variables:
```env
PRIVATE_KEY=your_wallet_private_key
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
AMOY_VRF_SUBSCRIPTION_ID=your_chainlink_vrf_subscription_id
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## 📦 Package Scripts

### Smart Contracts
```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Polygon Amoy testnet
npm run deploy:amoy

# Check contract status
npm run status:amoy
```

### Frontend Applications
```bash
# Run primary frontend (packages/app)
npm run app

# Run legacy frontend (packages/legacy-ui)  
npm run legacy-ui

# Build production versions
npm run app:build
npm run legacy-ui:build
```

### Player Commands
```bash
# Buy lottery tickets (1-100 tickets)
npm run buy-tickets:amoy -- --tickets=5

# Check your player info and history
npm run player-info:amoy

# End lottery when time expires
npm run end-lottery:amoy

# Claim prize if you won
npm run claim-prize:amoy -- --round=1
```

### Owner Commands
```bash
# Withdraw accumulated fees (owner only)
npm run withdraw-fees:amoy

# Check contract status and fees
npm run status:amoy
```

### Utility & Development Tools
```bash
# Test contract interaction
npm run test:amoy

# Setup VRF subscription guide
npm run setup-vrf:amoy

# Update frontend configuration
npm run update-frontend

# Verify contract on block explorer
npm run verify:amoy
```

## 🎰 Contract Features

- **Fixed ticket price**: 0.01 MATIC per ticket
- **7-day lottery rounds**: Automatic round management  
- **5% owner fee**: Sustainable revenue model
- **Chainlink VRF v2**: Provably fair randomness
- **Security features**: ReentrancyGuard, proper access controls

## 🌐 Supported Networks

- **Polygon Amoy** (recommended testnet): Chain ID 80002
- **Polygon Mumbai** (deprecated): Chain ID 80001  
- **Polygon Mainnet**: Chain ID 137
- **Local development**: Chain ID 31337

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:
- Solidity 0.8.20 with IR-based compilation
- 1000 optimizer runs
- Average gas costs:
  - Buy tickets: ~138,555 gas
  - End lottery: ~130,129 gas  
  - Claim prize: ~45,159 gas

## 📚 Documentation

- **[CLI Commands Guide](docs/CLI_GUIDE.md)** - Complete guide to all CLI commands
- [Technical Guide](docs/TECHNICAL_GUIDE.md) - Smart contract implementation details
- [Deployment Guide](docs/TESTNET_DEPLOYMENT_GUIDE.md) - How to deploy to networks
- [Contract Verification](docs/VERIFICATION_GUIDE.md) - Verify contracts on explorers

## 🔗 Key Links

- [Polygon Amoy Explorer](https://amoy.polygonscan.com/)
- [Chainlink VRF](https://vrf.chain.link/polygon-amoy)
- [Polygon Faucet](https://faucet.polygon.technology/)

## 🛡️ Security

- Comprehensive test suite (29 tests)
- ReentrancyGuard protection
- Owner-only functions for fee management
- Emergency withdrawal functionality
- Input validation and bounds checking

## 📄 License

MIT License - see individual package.json files for details.

---

**⚠️ Testnet Usage**: This project is configured for Polygon Amoy testnet by default. Always test thoroughly before mainnet deployment.