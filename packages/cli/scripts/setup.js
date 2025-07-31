const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🎰 Setting up LuckyOne Lottery DApp...\n");

  // Check if we're on hardhat network
  const network = hre.network.name;
  console.log(`Network: ${network}`);

  if (network === "hardhat") {
    console.log("❌ Cannot setup on hardhat network. Please run:");
    console.log("   npm run node");
    console.log("   npm run setup:local");
    return;
  }

  // Deploy contract
  console.log("📦 Deploying LuckyOne contract...");
  const deployScript = require('./deploy.js');
  
  // Wait for deployment to complete
  console.log("✅ Contract deployment completed!");
  
  // Read deployment info
  const deploymentFile = `deployments/${network}.json`;
  if (fs.existsSync(deploymentFile)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    
    console.log("\n🎯 Contract deployed successfully!");
    console.log(`Address: ${deploymentInfo.lotteryAddress}`);
    console.log(`Network: ${deploymentInfo.network}`);
    console.log(`Block Explorer: ${deploymentInfo.blockExplorer || 'N/A'}`);
    
    // Update frontend configuration
    const frontendConfigPath = 'frontend/src/utils/contractABI.js';
    if (fs.existsSync(frontendConfigPath)) {
      let frontendConfig = fs.readFileSync(frontendConfigPath, 'utf8');
      
      // Update contract address
      frontendConfig = frontendConfig.replace(
        /CONTRACT_ADDRESS: "[^"]*"/,
        `CONTRACT_ADDRESS: "${deploymentInfo.lotteryAddress}"`
      );
      
      // Update network config
      frontendConfig = frontendConfig.replace(
        /CHAIN_ID: \d+/,
        `CHAIN_ID: ${deploymentInfo.network === 'localhost' ? 31337 : 11155111}`
      );
      
      frontendConfig = frontendConfig.replace(
        /NETWORK_NAME: "[^"]*"/,
        `NETWORK_NAME: "${deploymentInfo.network}"`
      );
      
      fs.writeFileSync(frontendConfigPath, frontendConfig);
      console.log("✅ Frontend configuration updated!");
    }
    
    console.log("\n🚀 Setup complete! You can now:");
    console.log("   npm run frontend    # Start the frontend");
    console.log("   npm test            # Run tests");
    
  } else {
    console.log("❌ Deployment file not found. Please check deployment.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });