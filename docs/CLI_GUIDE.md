# Lottery CLI Commands Guide

A comprehensive guide to all available CLI commands for interacting with the Decentralized Lottery smart contract.

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
npm run status:amoy

# Buy lottery tickets
TICKETS=5 npm run buy-tickets:amoy

# Check your player info
npm run player-info:amoy

# End lottery (when time expires)
npm run end-lottery:amoy

# Claim prize (if you won)
ROUND=1 npm run claim-prize:amoy
```

### Owner Commands
```bash
# Withdraw accumulated fees (owner only)
npm run withdraw-fees:amoy

# Deploy new contract
npm run deploy:amoy
```

## 🎟️ Player Commands

### 1. Buy Tickets

Purchase lottery tickets for the current or specific round.

```bash
TICKETS=N [ROUND=R] npm run buy-tickets:amoy
```

**Environment Variables:**
- `TICKETS=N`: Number of tickets to buy (1-100, default: 1)
- `ROUND=R`: Specific round ID (optional, default: current round)

**Examples:**
```bash
# Buy 1 ticket for current round (default)
npm run buy-tickets:amoy

# Buy 25 tickets for current round
TICKETS=25 npm run buy-tickets:amoy

# Buy 5 tickets for specific round
TICKETS=5 ROUND=2 npm run buy-tickets:amoy
```

**Requirements:**
- Sufficient MATIC balance (0.01 MATIC per ticket)
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
ROUND=N npm run claim-prize:amoy
```

**Environment Variables:**
- `ROUND=N`: Round ID to claim prize from (required)

**Examples:**
```bash
# Claim prize from round 1
ROUND=1 npm run claim-prize:amoy

# Claim prize from round 5
ROUND=5 npm run claim-prize:amoy
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
npm run end-lottery:amoy [--round=N] [--force]
```

**Parameters:**
- `--round=N`: Specific round to end (optional, default: current round)
- `--force`: Force end before time expires (testing only)

**Examples:**
```bash
# End current lottery round
npm run end-lottery:amoy

# End specific round
npm run end-lottery:amoy -- --round=2

# Force end (testing only)
npm run end-lottery:amoy -- --force

# See help
npm run end-lottery:amoy -- --help
```

**Requirements:**
- Lottery period must be over (7 days from start)
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
npm run player-info:amoy [--address=ADDR] [--rounds=N]
```

**Parameters:**
- `--address=ADDR`: Address to check (default: your address)
- `--rounds=N`: Number of recent rounds to check (default: 5)

**Examples:**
```bash
# Check your own info
npm run player-info:amoy

# Check last 10 rounds
npm run player-info:amoy -- --rounds=10

# Check another player
npm run player-info:amoy -- --address=0x1234...

# Detailed check of another player
npm run player-info:amoy -- --address=0x1234... --rounds=20

# See help
npm run player-info:amoy -- --help
```

**Output:**
- Round-by-round participation history
- Win/loss statistics
- Total spending and winnings
- Unclaimed prizes (if any)
- Current round participation

## 👑 Owner Commands

### 1. Withdraw Fees

Withdraw accumulated owner fees (5% of all ticket sales).

```bash
npm run withdraw-fees:amoy
```

**Examples:**
```bash
# Withdraw fees on Amoy testnet
npm run withdraw-fees:amoy

# Withdraw fees on Polygon mainnet
npm run withdraw-fees:polygon

# See help
npm run withdraw-fees:amoy -- --help
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
npm run status:amoy
```

**Examples:**
```bash
# Check Amoy testnet status
npm run status:amoy

# Check Polygon mainnet status
npm run status:polygon

# Check Mumbai testnet status (deprecated)
npm run status:mumbai
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
npm run test-contract:amoy
```

**Examples:**
```bash
# Test on Amoy testnet
npm run test:amoy

# Test on Polygon mainnet
npm run test:polygon
```

**Output:**
- Contract information verification
- Sample ticket purchases
- Event emission testing
- Gas usage analysis

## 🔧 Development Commands

### 1. Deploy Contract

Deploy the lottery contract to a network.

```bash
npm run deploy:NETWORK
```

**Examples:**
```bash
# Deploy to local hardhat network
npm run deploy:local

# Deploy to Polygon Amoy testnet
npm run deploy:amoy

# Deploy to Polygon mainnet
npm run deploy:polygon
```

**Requirements:**
- Valid VRF subscription (for testnets/mainnet)
- Sufficient MATIC for deployment
- Proper environment variables set

### 2. Verify Contract

Verify deployed contract on block explorer.

```bash
npm run verify:amoy
```

**Examples:**
```bash
# Verify on Amoy testnet
npm run verify:amoy

# Verify on Polygon mainnet
npm run verify:polygon
```

### 3. Setup VRF

Guide for setting up Chainlink VRF subscription.

```bash
npm run setup-vrf:amoy
```

**Examples:**
```bash
# VRF setup guide for Amoy
npm run setup-vrf:amoy

# VRF setup guide for Polygon
npm run setup-vrf:polygon
```

### 4. Update Frontend

Update frontend configuration with deployed contract info.

```bash
npm run update-frontend
```

## 🌐 Network Support

### Polygon Amoy Testnet (Recommended)
- **Chain ID:** 80002
- **Currency:** MATIC
- **Faucet:** https://faucet.polygon.technology/
- **Explorer:** https://amoy.polygonscan.com/
- **VRF UI:** https://vrf.chain.link/polygon-amoy

### Polygon Mainnet
- **Chain ID:** 137
- **Currency:** MATIC
- **Explorer:** https://polygonscan.com/
- **VRF UI:** https://vrf.chain.link/polygon

### Local Development
- **Chain ID:** 31337
- **Network:** localhost
- **Usage:** Testing and development

### Mumbai (Deprecated)
- **Chain ID:** 80001
- **Status:** ⚠️ Deprecated, use Amoy instead

## 📚 Common Examples

### Complete Player Workflow

```bash
# 1. Check current lottery status
npm run status:amoy

# 2. Buy some tickets
npm run buy-tickets:amoy -- --tickets=10

# 3. Check your participation
npm run player-info:amoy

# 4. Wait for lottery to end, then end it
npm run end-lottery:amoy

# 5. Check if you won
npm run status:amoy

# 6. Claim prize if you won
npm run claim-prize:amoy -- --round=1
```

### Owner Management Workflow

```bash
# 1. Check accumulated fees
npm run status:amoy

# 2. Withdraw fees when accumulated
npm run withdraw-fees:amoy

# 3. Monitor contract status
npm run status:amoy
```

### Development Workflow

```bash
# 1. Deploy contract
npm run deploy:amoy

# 2. Test functionality
npm run test:amoy

# 3. Verify contract
npm run verify:amoy

# 4. Update frontend
npm run update-frontend

# 5. Run frontend
npm run app
```

## 🐛 Troubleshooting

### Common Errors

#### "No deployment found"
```bash
Error: No deployment found for polygonAmoy. Please deploy first.
```
**Solution:** Deploy the contract first:
```bash
npm run deploy:amoy
```

#### "Insufficient balance"
```bash
Error: Insufficient balance. Need: 0.05 MATIC
```
**Solution:** Get MATIC from faucet:
- Polygon Amoy: https://faucet.polygon.technology/
- Check balance: Look at command output

#### "Incorrect payment amount"
```bash
Error: Incorrect payment amount
```
**Solution:** Ensure exact payment (ticketCount × 0.01 MATIC):
```bash
# For 5 tickets: exactly 0.05 MATIC required
npm run buy-tickets:amoy -- --tickets=5
```

#### "Lottery has ended"
```bash
Error: Lottery has ended
```
**Solution:** Check current round and buy for active round:
```bash
npm run status:amoy  # Check current round
npm run buy-tickets:amoy -- --tickets=5  # Buy for current round
```

#### "Not the winner"
```bash
Error: Not the winner
```
**Solution:** Only winners can claim prizes:
```bash
npm run player-info:amoy  # Check your winning rounds
npm run claim-prize:amoy -- --round=N  # Claim from winning round
```

#### "VRF subscription issues"
**Solution:** Ensure VRF subscription has LINK:
```bash
npm run setup-vrf:amoy  # Follow VRF setup guide
```

### Gas Issues

#### High gas prices
- Use Polygon (lower fees than Ethereum)
- Wait for lower network congestion
- Polygon typically has stable, low fees

#### Transaction failures
- Ensure sufficient MATIC for gas
- Check network congestion
- Retry with higher gas limit if needed

### Network Issues

#### Wrong network
**Solution:** Ensure MetaMask is connected to correct network:
- Polygon Amoy: Chain ID 80002
- Polygon: Chain ID 137

#### RPC issues
**Solution:** Check `.env` file for correct RPC URLs:
```env
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
```

## 🔗 Helpful Links

- **Polygon Faucet:** https://faucet.polygon.technology/
- **Amoy Explorer:** https://amoy.polygonscan.com/
- **Chainlink VRF:** https://vrf.chain.link/polygon-amoy
- **Polygon Documentation:** https://docs.polygon.technology/

## 💡 Tips

1. **Always check status first:** `npm run status:amoy`
2. **Test with small amounts:** Start with 1-2 tickets
3. **Monitor gas costs:** Commands show estimated gas usage
4. **Keep VRF funded:** Ensure LINK balance for winner selection
5. **Claim prizes promptly:** No expiration, but good practice
6. **Use testnet first:** Test on Amoy before mainnet

---

**Need Help?** Use the `--help` flag with any command to see detailed usage information:
```bash
npm run buy-tickets:amoy -- --help
npm run claim-prize:amoy -- --help
npm run status:amoy -- --help
```