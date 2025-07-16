const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  console.log("=== VRF Subscription Setup for", networkName, "===");
  console.log("Account:", deployer.address);
  
  // Network-specific configurations
  const configs = {
    polygonAmoy: {
      vrfCoordinator: "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2",
      linkToken: "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904",
      linkFaucet: "https://faucets.chain.link/polygon-amoy",
      vrfUI: "https://vrf.chain.link/polygon-amoy"
    },
    polygonMumbai: {
      vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
      linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      linkFaucet: "https://faucets.chain.link/mumbai",
      vrfUI: "https://vrf.chain.link/mumbai",
      deprecated: true
    },
    polygon: {
      vrfCoordinator: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
      linkToken: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
      vrfUI: "https://vrf.chain.link/polygon"
    }
  };
  
  const config = configs[networkName];
  if (!config) {
    console.error(`Unsupported network: ${networkName}`);
    return;
  }
  
  console.log("VRF Coordinator:", config.vrfCoordinator);
  console.log("LINK Token:", config.linkToken);
  
  if (config.deprecated) {
    console.log("⚠️  WARNING: This network is deprecated! Use Polygon Amoy instead.");
  }
  
  // Check LINK balance
  const linkABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];
  
  try {
    const linkToken = new ethers.Contract(config.linkToken, linkABI, deployer);
    const balance = await linkToken.balanceOf(deployer.address);
    const decimals = await linkToken.decimals();
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    console.log("LINK Balance:", formattedBalance, "LINK");
    
    if (parseFloat(formattedBalance) < 2) {
      console.log("⚠️  Low LINK balance! Get more LINK from:");
      if (config.linkFaucet) {
        console.log("   Faucet:", config.linkFaucet);
      }
      console.log("   Or buy LINK and bridge to", networkName);
    }
  } catch (error) {
    console.error("Error checking LINK balance:", error.message);
  }
  
  console.log("\n=== Next Steps ===");
  console.log("1. Get LINK tokens (minimum 2 LINK recommended)");
  console.log("2. Go to VRF UI:", config.vrfUI);
  console.log("3. Connect your wallet");
  console.log("4. Create a new subscription");
  console.log("5. Fund the subscription with LINK");
  console.log("6. Copy the subscription ID");
  console.log("7. Update your .env file with the subscription ID");
  console.log("8. Deploy your contract");
  console.log("9. Add your contract as a consumer in the VRF UI");
  
  // Check if we have deployment info
  const fs = require('fs');
  const deploymentFile = `deployments/${networkName}.json`;
  
  if (fs.existsSync(deploymentFile)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    console.log("\n=== Deployed Contract Info ===");
    console.log("Contract Address:", deploymentInfo.lotteryAddress);
    console.log("Subscription ID:", deploymentInfo.subscriptionId);
    console.log("Add this contract as a consumer in the VRF UI!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });