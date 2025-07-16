# Testnet Deployment Guide

This guide walks you through deploying and testing the lottery contract on Polygon Mumbai testnet.

## Prerequisites

### 1. Get Testnet MATIC Tokens
1. **Mumbai MATIC Faucet**: https://faucet.polygon.technology/
2. **Alchemy Mumbai Faucet**: https://mumbaifaucet.com/
3. **QuickNode Faucet**: https://faucet.quicknode.com/polygon/mumbai

### 2. Set Up Chainlink VRF Subscription
1. Go to [Chainlink VRF Mumbai](https://vrf.chain.link/mumbai)
2. Connect your wallet
3. Create a new subscription
4. Fund it with LINK tokens (get from [Mumbai LINK Faucet](https://faucets.chain.link/mumbai))
5. Copy the subscription ID

### 3. Update Environment Variables
```bash
# Update .env file with your values
MUMBAI_VRF_SUBSCRIPTION_ID=YOUR_SUBSCRIPTION_ID_HERE
POLYGONSCAN_API_KEY=YOUR_POLYGONSCAN_API_KEY_HERE
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com/
```

## Deployment Steps

### Step 1: Compile Contract
```bash
npm run compile
```

### Step 2: Deploy to Mumbai
```bash
npm run deploy:mumbai
```

### Step 3: Add Contract as VRF Consumer
1. Go to [Chainlink VRF Mumbai](https://vrf.chain.link/mumbai)
2. Select your subscription
3. Click "Add consumer"
4. Enter your deployed contract address
5. Confirm the transaction

### Step 4: Test Contract Functions
```bash
npx hardhat run scripts/test-contract.js --network polygonAmoy
```

## Testing Checklist

### ✅ Basic Functionality
- [ ] Contract deployment successful
- [ ] Owner is correctly set
- [ ] First lottery round started
- [ ] Ticket price is correct (0.01 MATIC)

### ✅ Ticket Purchase
- [ ] Can buy tickets with correct payment
- [ ] Prize pool accumulates correctly (95% of ticket sales)
- [ ] Owner fees accumulate correctly (5% of ticket sales)
- [ ] Player ticket count is tracked

### ✅ Fee System
- [ ] Owner can view accumulated fees
- [ ] Owner can withdraw fees
- [ ] Non-owner cannot withdraw fees
- [ ] Fees reset after withdrawal

### ✅ Lottery End & Winner Selection
- [ ] Lottery ends after 7 days
- [ ] VRF request is made successfully
- [ ] Winner is selected randomly
- [ ] Winner can claim prize
- [ ] New lottery round starts

### ✅ Events & Verification
- [ ] Contract is verified on Polygonscan
- [ ] Events are emitted correctly
- [ ] Frontend integration works

## Common Issues & Solutions

### Issue: "VRF_SUBSCRIPTION_ID not set"
**Solution**: Update `.env` with your Mumbai VRF subscription ID

### Issue: "Insufficient funds for gas"
**Solution**: Get more MATIC from Mumbai faucet

### Issue: "VRF request failed"
**Solution**: 
1. Check VRF subscription has enough LINK
2. Verify contract is added as consumer
3. Ensure VRF coordinator address is correct

### Issue: "Contract verification failed"
**Solution**: 
1. Check POLYGONSCAN_API_KEY is set
2. Verify constructor parameters match deployment
3. Try manual verification on Polygonscan

## Mumbai Network Details

- **Chain ID**: 80001
- **Currency**: MATIC
- **Block Explorer**: https://mumbai.polygonscan.com/
- **RPC URL**: https://rpc-mumbai.maticvigil.com/
- **VRF Coordinator**: 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
- **Gas Lane**: 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f

## Next Steps

After successful Mumbai testing:
1. Update environment variables for Polygon mainnet
2. Get mainnet MATIC and LINK tokens
3. Create mainnet VRF subscription
4. Deploy to mainnet using `npm run deploy:polygon`

## Support

- **Chainlink VRF Docs**: https://docs.chain.link/vrf/v2/subscription/supported-networks
- **Polygon Docs**: https://wiki.polygon.technology/docs/develop/network-details/network
- **Hardhat Docs**: https://hardhat.org/hardhat-network/docs/overview