# LuckyOne CLI Commands Guide

A comprehensive guide to all available CLI commands for interacting with the LuckyOne lottery smart contract.

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Player Commands](#player-commands)
3. [Owner Commands](#owner-commands)
4. [Utility Commands](#utility-commands)
5. [Development Commands](#development-commands)
6. [Network Support](#network-support)
7. [Common Examples](#common-examples)
8. [Troubleshooting](#troubleshooting)

## 🚀 Quick Reference

### Essential Commands
```bash
# Check lottery status
npm run status

# Buy lottery tickets
TICKETS=5 npm run buy-tickets

# Check your player info
npm run player-info

# End lottery (when time expires)
npm run end-lottery

# Claim prize (if you won)
ROUND=1 npm run claim-prize
```

### Owner Commands
```bash
# Withdraw accumulated fees (owner only)
npm run withdraw-fees

# Deploy new contract
npm run deploy
```

## 🎟️ Player Commands

### 1. Buy Tickets

Purchase lottery tickets for the current or specific round.

```bash
TICKETS=N [ROUND=R] npm run buy-tickets
```

**Environment Variables:**
- `TICKETS=N`: Number of tickets to buy (1-100, default: 1)
- `ROUND=R`: Specific round ID (optional, default: current round)

**Examples:**
```bash
# Buy 1 ticket for current round (default)
npm run buy-tickets

# Buy 25 tickets for current round
TICKETS=25 npm run buy-tickets

# Buy 5 tickets for specific round
TICKETS=5 ROUND=2 npm run buy-tickets
```

**Requirements:**
- Sufficient POL balance (10 POL per ticket)
- Lottery round must be OPEN
- Maximum 100 tickets per transaction
- Round must not have ended

**Output:**
- Transaction confirmation
- Updated ticket count and win chance
- Prize pool information
- Gas costs

### 2. Claim Prize

Claim your winning prize from a completed lottery round.

```bash
ROUND=N npm run claim-prize
```

**Environment Variables:**
- `ROUND=N`: Round ID to claim prize from (required)

**Examples:**
```bash
# Claim prize from round 1
ROUND=1 npm run claim-prize

# Claim prize from round 5
ROUND=5 npm run claim-prize
```

**Requirements:**
- You must be the winner of the specified round
- Winner must be selected (Chainlink VRF completed)
- Prize must not have been claimed yet
- Round must be ended

**Output:**
- Prize amount claimed
- Transaction confirmation
- Updated wallet balance

### 3. End Lottery

End the current lottery round when the time period expires.

```bash
npm run end-lottery [--round=N] [--force]
```

**Parameters:**
- `--round=N`: Specific round to end (optional, default: current round)
- `--force`: Force end before time expires (testing only)

**Examples:**
```bash
# End current lottery round
npm run end-lottery

# End specific round
npm run end-lottery -- --round=2

# Force end (testing only)
npm run end-lottery -- --force

# See help
npm run end-lottery -- --help
```

**Requirements:**
- Lottery period must be over (24 hours from start)
- At least one ticket must be sold
- Round must not already be ended
- Valid VRF subscription with LINK balance

**Output:**
- VRF request ID for random number generation
- Transaction confirmation
- Instructions for monitoring winner selection

### 4. Player Information

View detailed information about your or another player's participation.

```bash
npm run player-info [--address=ADDR] [--rounds=N]
```

**Parameters:**
- `--address=ADDR`: Address to check (default: your address)
- `--rounds=N`: Number of recent rounds to check (default: 5)

**Examples:**
```bash
# Check your own info
npm run player-info

# Check last 10 rounds
npm run player-info -- --rounds=10

# Check another player
npm run player-info -- --address=0x1234...

# Detailed check of another player
npm run player-info -- --address=0x1234... --rounds=20

# See help
npm run player-info -- --help
```

**Output:**
- Round-by-round participation history
- Win/loss statistics
- Total spending and winnings
- Unclaimed prizes (if any)
- Current round participation

## 👑 Owner Commands

### 1. Withdraw Fees

Withdraw accumulated owner fees from ticket sales.

```bash
npm run withdraw-fees
```

**Examples:**
```bash
# Withdraw fees on Polygon mainnet
npm run withdraw-fees

# See help
npm run withdraw-fees -- --help
```

**Requirements:**
- Must be called by the contract owner
- There must be accumulated fees to withdraw
- Contract must have sufficient balance

**Output:**
- Amount withdrawn
- Updated contract and wallet balances
- Fee accumulation information

## 🛠️ Utility Commands

### 1. Lottery Status

View comprehensive lottery status and information.

```bash
npm run status
```

**Examples:**
```bash
# Check Polygon mainnet status
npm run status

# Setup existing contract for different networks
npm run setup-existing-contract -- --network=polygon
npm run setup-existing-contract -- --network=polygonAmoy
```

**Output:**
- Current round information
- Time remaining
- Prize pool and ticket sales
- Your participation
- Recent activity
- Available actions

### 2. Contract Testing

Test contract functionality with sample transactions.

```bash
npm run test
```

**Examples:**
```bash
# Test on Polygon mainnet
npm run test

# Test with Hardhat (local development)
npm run test-hardhat
```

**Output:**
- Contract information verification
- Sample ticket purchases
- Event emission testing
- Gas usage analysis

## 🔧 Development Commands

### 1. Deploy Contract

Deploy the lottery contract to Polygon mainnet.

```bash
npm run deploy
```

**Examples:**
```bash
# Deploy to Polygon mainnet
npm run deploy

# Setup existing contract (for different networks)
npm run setup-existing-contract -- --network=polygon
npm run setup-existing-contract -- --network=polygonAmoy
```

**Requirements:**
- Valid VRF subscription with LINK funding
- Sufficient POL for deployment
- Proper environment variables set

### 2. Verify Contract

Verify deployed contract on block explorer.

```bash
npm run verify-contract
```

**Examples:**
```bash
# Verify on Polygon mainnet
npm run verify-contract

# Generate flattened source for manual verification
npm run flatten
```

### 3. Setup VRF

Guide for setting up Chainlink VRF subscription.

```bash
npm run setup-vrf
```

**Examples:**
```bash
# VRF setup guide for Polygon mainnet
npm run setup-vrf

# Setup existing contract with known VRF config
npm run setup-existing-contract -- --network=polygon
```

### 4. Update Frontend

Update frontend configuration with deployed contract info.

```bash
npm run update-frontend
```

## 🌐 Network Support

### Polygon Mainnet (Default)
- **Chain ID:** 137
- **Currency:** POL
- **Explorer:** https://polygonscan.com/
- **VRF UI:** https://vrf.chain.link/polygon
- **Contract:** 0x65C7F3cB0F1DA3d7566e28d49F995c30d5F75ec0

### Development & Testing
For development and testing, you can deploy to testnets like Polygon Amoy:
- **Chain ID:** 80002
- **Currency:** POL (testnet)
- **Faucet:** https://faucet.polygon.technology/
- **Explorer:** https://amoy.polygonscan.com/
- **VRF UI:** https://vrf.chain.link/polygon-amoy

### Local Development
- **Chain ID:** 31337
- **Network:** localhost
- **Usage:** Use hardhat local network for testing

## 📚 Common Examples

### Complete Player Workflow

```bash
# 1. Check current lottery status
npm run status

# 2. Buy some tickets
TICKETS=10 npm run buy-tickets

# 3. Check your participation
npm run player-info

# 4. Wait for lottery to end, then end it
npm run end-lottery

# 5. Check if you won
npm run status

# 6. Claim prize if you won
ROUND=1 npm run claim-prize
```

### Owner Management Workflow

```bash
# 1. Check accumulated fees
npm run status

# 2. Withdraw fees when accumulated
npm run withdraw-fees

# 3. Monitor contract status
npm run status
```

### Development Workflow

```bash
# 1. Deploy contract (if needed)
npm run deploy

# 2. Test functionality
npm run test

# 3. Verify contract
npm run verify-contract

# 4. Update frontend
npm run update-frontend

# 5. Run frontend
npm run app
```

## 🐛 Troubleshooting

### Common Errors

#### "No deployment found"
```bash
Error: No deployment found for polygon. Please deploy first.
```
**Solution:** Use setup-existing-contract or deploy:
```bash
npm run setup-existing-contract -- --network=polygon
# OR deploy new contract
npm run deploy
```

#### "Insufficient balance"
```bash
Error: Insufficient balance. Need: 0.05 POL
```
**Solution:** Get POL tokens:
- Polygon Mainnet: Purchase POL on exchanges
- Polygon Amoy (testnet): https://faucet.polygon.technology/
- Check balance: Look at command output

#### "Incorrect payment amount"
```bash
Error: Incorrect payment amount
```
**Solution:** Ensure exact payment (ticketCount × 10 POL):
```bash
# For 5 tickets: exactly 50 POL required
TICKETS=5 npm run buy-tickets
```

#### "Lottery has ended"
```bash
Error: Lottery has ended
```
**Solution:** Check current round and buy for active round:
```bash
npm run status  # Check current round
TICKETS=5 npm run buy-tickets  # Buy for current round
```

#### "Not the winner"
```bash
Error: Not the winner
```
**Solution:** Only winners can claim prizes:
```bash
npm run player-info  # Check your winning rounds
ROUND=N npm run claim-prize  # Claim from winning round
```

#### "VRF subscription issues"
**Solution:** Ensure VRF subscription has LINK:
```bash
npm run setup-vrf  # Follow VRF setup guide
```

### Gas Issues

#### High gas prices
- Polygon mainnet has very low fees compared to Ethereum
- Wait for lower network congestion if needed
- POL transactions are typically under $0.01

#### Transaction failures
- Ensure sufficient POL for gas
- Check network congestion
- Retry with higher gas limit if needed

### Network Issues

#### Wrong network
**Solution:** Ensure MetaMask is connected to correct network:
- Polygon Mainnet: Chain ID 137 (default)
- Polygon Amoy: Chain ID 80002 (for testing)

#### RPC issues
**Solution:** Check `.env` file for correct RPC URLs:
```env
POLYGON_RPC_URL=https://polygon-rpc.com/
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
```

## 🔗 Helpful Links

- **Polygon Explorer:** https://polygonscan.com/
- **Chainlink VRF:** https://vrf.chain.link/polygon
- **Polygon Faucet (Testnet):** https://faucet.polygon.technology/
- **Amoy Explorer (Testnet):** https://amoy.polygonscan.com/
- **Polygon Documentation:** https://docs.polygon.technology/

## 💡 Tips

1. **Always check status first:** `npm run status`
2. **Test with small amounts:** Start with 1-2 tickets
3. **Monitor gas costs:** Commands show estimated gas usage
4. **Keep VRF funded:** Ensure LINK balance for winner selection
5. **Claim prizes promptly:** No expiration, but good practice
6. **Use testnet for testing:** `npm run setup-existing-contract -- --network=polygonAmoy`

---

**Need Help?** Use the `--help` flag with any command to see detailed usage information:
```bash
npm run buy-tickets -- --help
npm run claim-prize -- --help
npm run status -- --help

# For network setup
npm run setup-existing-contract -- --help
```