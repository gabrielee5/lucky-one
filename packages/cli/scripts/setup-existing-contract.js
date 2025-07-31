const fs = require('fs');
const path = require('path');

// Known contract deployments - update when new contracts are deployed
const KNOWN_CONTRACTS = {
  polygon: {
    network: "polygon",
    lotteryAddress: "0x8d634F54373aC8aAf2dfEc5AA68e76e4Ff6d80a2",
    vrfCoordinator: "0xec0Ed46f36576541C75739E915ADbCb3DE24bD77",
    subscriptionId: "32656897740179949429777170792740528103673297430821130280940612776308300330303",
    gasLane: "0x192234a5cda4cc07c0b66dfbcfbb785341cc790edc50032e842667dbb506cada",
    callbackGasLimit: "500000",
    deployedAt: "2025-07-31T16:29:23.631Z", 
    deployer: "0xaAb927Bbaf53bA701d8108893D35B6d49F5E94b9" 
  },
  polygonAmoy: {
    network: "polygonAmoy",
    lotteryAddress: "0xaE3214F7b7ba132FEE0227F0a6828018Db8d83E9",
    vrfCoordinator: "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2",
    subscriptionId: "81198301195676925589395342136133294033604020813633657791162110126118441171872",
    gasLane: "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899",
    callbackGasLimit: "500000",
    deployedAt: "2025-07-16T10:58:16.339Z",
    deployer: "0xaAb927Bbaf53bA701d8108893D35B6d49F5E94b9"
  },
  localhost: {
    network: "localhost", 
    lotteryAddress: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    vrfCoordinator: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    subscriptionId: "1",
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    callbackGasLimit: "500000",
    deployedAt: "2025-07-15T08:17:17.222Z",
    deployer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  }
  // Add more networks as they're deployed
};

async function main() {
  console.log("🔧 === SETUP EXISTING CONTRACT ===");
  console.log("This script sets up your local environment to interact with existing deployed contracts.");
  console.log();

  // Get network parameter
  const args = process.argv.slice(2);
  let targetNetwork = args.find(arg => arg.startsWith('--network='))?.split('=')[1];
  
  if (!targetNetwork) {
    console.log("📋 AVAILABLE NETWORKS:");
    Object.keys(KNOWN_CONTRACTS).forEach(network => {
      const contract = KNOWN_CONTRACTS[network];
      console.log(`   • ${network}: ${contract.lotteryAddress}`);
    });
    console.log();
    console.log("Usage: npm run setup-existing-contract -- --network=polygon");
    return;
  }

  if (!KNOWN_CONTRACTS[targetNetwork]) {
    console.error(`❌ Unknown network: ${targetNetwork}`);
    console.log("Available networks:", Object.keys(KNOWN_CONTRACTS).join(', '));
    return;
  }

  const contractInfo = KNOWN_CONTRACTS[targetNetwork];
  
  console.log(`🎯 Setting up for network: ${targetNetwork}`);
  console.log(`📍 Contract Address: ${contractInfo.lotteryAddress}`);
  console.log(`👑 Original Deployer: ${contractInfo.deployer}`);
  console.log(`📅 Deployed: ${contractInfo.deployedAt}`);
  console.log();

  // Create deployments directory if it doesn't exist
  const deploymentDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
    console.log("📁 Created deployments directory");
  }

  // Create deployment file
  const deploymentFile = path.join(deploymentDir, `${targetNetwork}.json`);
  
  if (fs.existsSync(deploymentFile)) {
    console.log("⚠️  Deployment file already exists!");
    console.log("Current content:");
    const existing = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    console.log(`   Address: ${existing.lotteryAddress}`);
    console.log();
    
    // Ask if they want to overwrite (simplified - just proceed)
    console.log("Overwriting with known good configuration...");
  }

  // Write deployment file
  fs.writeFileSync(deploymentFile, JSON.stringify(contractInfo, null, 2));
  console.log(`✅ Created ${deploymentFile}`);
  console.log();

  // Test connection
  console.log("🧪 Testing connection to contract...");
  try {
    const { ethers } = require("hardhat");
    
    // Set the network for this test
    if (targetNetwork !== 'localhost') {
      console.log(`📡 Connecting to ${targetNetwork}...`);
    }
    
    const lottery = await ethers.getContractAt("LuckyOne", contractInfo.lotteryAddress);
    
    // Test basic contract calls
    const owner = await lottery.getOwner();
    const ticketPrice = await lottery.getTicketPrice();
    const currentRound = await lottery.getCurrentRoundId();
    
    console.log("✅ Connection successful!");
    console.log(`   Owner: ${owner}`);
    console.log(`   Ticket Price: ${ethers.formatEther(ticketPrice)} MATIC`);
    console.log(`   Current Round: ${currentRound.toString()}`);
    console.log();
    
    console.log("🎉 SETUP COMPLETE!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("You can now interact with the existing lottery contract using:");
    console.log();
    console.log(`   npm run status:${targetNetwork}`);
    console.log(`   npm run buy-tickets:${targetNetwork} -- --tickets=5`);
    console.log(`   npm run player-info:${targetNetwork}`);
    console.log(`   npm run end-lottery:${targetNetwork}`);
    console.log(`   npm run claim-prize:${targetNetwork} -- --round=N`);
    console.log();
    
    if (targetNetwork === 'polygonAmoy') {
      console.log("🔗 Useful Links:");
      console.log(`   Block Explorer: https://amoy.polygonscan.com/address/${contractInfo.lotteryAddress}`);
      console.log("   Faucet: https://faucet.polygon.technology/");
      console.log("   VRF UI: https://vrf.chain.link/polygon-amoy");
    }
    
  } catch (error) {
    console.warn("⚠️  Connection test failed:", error.message);
    console.log("This might be normal if you're not connected to the right network.");
    console.log("The deployment file has been created and should work when you connect.");
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log("🔧 Setup Existing Contract");
  console.log();
  console.log("Description:");
  console.log("  Sets up your local environment to interact with existing deployed lottery contracts.");
  console.log("  This is useful when you've cloned the repo and want to use existing contracts");
  console.log("  instead of deploying new ones.");
  console.log();
  console.log("Usage:");
  console.log("  npm run setup-existing-contract -- --network=polygonAmoy");
  console.log("  npm run setup-existing-contract -- --network=localhost");
  console.log();
  console.log("Options:");
  console.log("  --network=NAME  Network to setup (polygonAmoy, localhost)");
  console.log("  --help, -h      Show this help message");
  console.log();
  console.log("What it does:");
  console.log("  1. Creates deployments/NETWORK.json with contract info");
  console.log("  2. Tests connection to the contract");
  console.log("  3. Provides usage instructions");
  console.log();
  console.log("After setup, you can immediately start using CLI commands!");
  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });