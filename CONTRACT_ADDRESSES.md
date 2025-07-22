# 📋 Contract Addresses

This file contains the addresses of deployed lottery contracts across different networks. Use these addresses to interact with existing contracts without deploying new ones.

## 🌐 Live Deployments

### Polygon Amoy Testnet (Recommended)
- **Contract Address**: `0xaE3214F7b7ba132FEE0227F0a6828018Db8d83E9`
- **Owner**: `0xaAb927Bbaf53bA701d8108893D35B6d49F5E94b9`
- **Deployed**: July 16, 2025
- **Block Explorer**: [View on AmoyScn](https://amoy.polygonscan.com/address/0xaE3214F7b7ba132FEE0227F0a6828018Db8d83E9)
- **Status**: ✅ Active
- **VRF Subscription**: `81198301195676925589395342136133294033604020813633657791162110126118441171872`

### Configuration Details
```json
{
  "network": "polygonAmoy",
  "lotteryAddress": "0xaE3214F7b7ba132FEE0227F0a6828018Db8d83E9",
  "vrfCoordinator": "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2",
  "subscriptionId": "81198301195676925589395342136133294033604020813633657791162110126118441171872",
  "gasLane": "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899",
  "callbackGasLimit": "500000"
}
```

## 🚀 Quick Setup for New Users

If you've just cloned this repo and want to interact with the existing lottery:

### Option 1: Use the setup script (coming soon)
```bash
npm run setup-existing-contract
```

### Option 2: Manual setup
1. Create the deployments directory:
```bash
mkdir -p packages/cli/deployments
```

2. Create the Amoy deployment file:
```bash
cat > packages/cli/deployments/polygonAmoy.json << 'EOF'
{
  "network": "polygonAmoy",
  "lotteryAddress": "0xaE3214F7b7ba132FEE0227F0a6828018Db8d83E9",
  "vrfCoordinator": "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2",
  "subscriptionId": "81198301195676925589395342136133294033604020813633657791162110126118441171872",
  "gasLane": "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899",
  "callbackGasLimit": "500000",
  "deployedAt": "2025-07-16T10:58:16.339Z",
  "deployer": "0xaAb927Bbaf53bA701d8108893D35B6d49F5E94b9"
}
EOF
```

3. Test the connection:
```bash
npm run status:amoy
```

## 🎯 How to Use

Once set up, you can immediately start interacting:

```bash
# Check lottery status
npm run status:amoy

# Buy tickets
npm run buy-tickets:amoy -- --tickets=5

# Check your player info
npm run player-info:amoy

# End lottery (when time expires)
npm run end-lottery:amoy

# Claim prizes (if you win)
npm run claim-prize:amoy -- --round=1
```

## 🔄 Updating Contract Addresses

When new contracts are deployed or networks are added, this file will be updated. Check the latest version for current addresses.

### How to Deploy Your Own Instance

If you want to deploy your own lottery contract instead of using the existing one:

1. Set up your environment variables in `.env`
2. Deploy to your chosen network:
```bash
npm run deploy:amoy
```
3. Your deployment will create a new contract and update your local deployment files

## 📞 Support

- **Current Owner**: `0xaAb927Bbaf53bA701d8108893D35B6d49F5E94b9`
- **Network**: Polygon Amoy Testnet (Chain ID: 80002)
- **Faucet**: https://faucet.polygon.technology/
- **Explorer**: https://amoy.polygonscan.com/

---

> ⚠️ **Note**: These are testnet deployments for demonstration purposes. Always verify contract addresses before interacting with mainnet contracts.