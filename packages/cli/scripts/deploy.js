const { ethers } = require("hardhat");
const { verify } = require("../utils/verify");

// Network-specific VRF configurations
const NETWORK_CONFIGS = {
  polygonAmoy: {
    vrfCoordinator: process.env.AMOY_VRF_COORDINATOR_V2,
    gasLane: process.env.AMOY_VRF_GAS_LANE,
    subscriptionId: process.env.AMOY_VRF_SUBSCRIPTION_ID,
    callbackGasLimit: process.env.AMOY_VRF_CALLBACK_GAS_LIMIT || 500000
  },
  polygon: {
    vrfCoordinator: process.env.POLYGON_VRF_COORDINATOR_V2,
    gasLane: process.env.POLYGON_VRF_GAS_LANE,
    subscriptionId: process.env.POLYGON_VRF_SUBSCRIPTION_ID,
    callbackGasLimit: process.env.POLYGON_VRF_CALLBACK_GAS_LIMIT || 500000
  }
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  const networkName = hre.network.name;
  console.log("Network:", networkName);

  let vrfCoordinator, subscriptionId, gasLane, callbackGasLimit;

  if (networkName === "hardhat" || networkName === "localhost") {
    console.log("Deploying to local network - setting up mock VRF Coordinator");
    
    // Deploy mock VRF Coordinator
    const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(
      ethers.parseEther("0.1"), // base fee
      ethers.parseUnits("1", "gwei") // gas price link
    );
    
    vrfCoordinator = await vrfCoordinatorV2Mock.getAddress();
    
    // Create subscription
    const txResponse = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await txResponse.wait();
    subscriptionId = 1;
    
    // Fund subscription
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, ethers.parseEther("1"));
    
    gasLane = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
    callbackGasLimit = 500000;
    
    console.log("Mock VRF Coordinator deployed to:", vrfCoordinator);
    console.log("Subscription ID:", subscriptionId);
    
  } else if (NETWORK_CONFIGS[networkName]) {
    console.log(`Deploying to ${networkName}`);
    
    const config = NETWORK_CONFIGS[networkName];
    vrfCoordinator = config.vrfCoordinator;
    subscriptionId = config.subscriptionId;
    gasLane = config.gasLane;
    callbackGasLimit = config.callbackGasLimit;
    
    if (!subscriptionId) {
      throw new Error(`VRF_SUBSCRIPTION_ID not set for ${networkName} in environment variables`);
    }
    
    console.log("Using VRF Coordinator:", vrfCoordinator);
    console.log("Subscription ID:", subscriptionId);
    console.log("Gas Lane:", gasLane);
    
  } else {
    throw new Error(`Unsupported network: ${networkName}`);
  }

  // Deploy LuckyOne
  console.log("Deploying LuckyOne...");
  const LuckyOne = await ethers.getContractFactory("LuckyOne");
  const lottery = await LuckyOne.deploy(
    vrfCoordinator,
    subscriptionId,
    gasLane,
    callbackGasLimit
  );

  await lottery.waitForDeployment();
  const lotteryAddress = await lottery.getAddress();
  console.log("LuckyOne deployed to:", lotteryAddress);

  // Add consumer to VRF subscription for local networks
  if (networkName === "hardhat" || networkName === "localhost") {
    const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinator);
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, lotteryAddress);
    console.log("Added lottery contract as VRF consumer");
  }

  // Verify contract on block explorers for testnet/mainnet
  if (networkName === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await lottery.deploymentTransaction().wait(6);
    
    console.log("Verifying contract on Etherscan...");
    await verify(lotteryAddress, [vrfCoordinator, subscriptionId, gasLane, callbackGasLimit]);
  } else if ((networkName === "polygonAmoy" || networkName === "polygonMumbai" || networkName === "polygon") && process.env.POLYGONSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await lottery.deploymentTransaction().wait(5);
    
    console.log("Verifying contract on Polygonscan...");
    await verify(lotteryAddress, [vrfCoordinator, subscriptionId, gasLane, callbackGasLimit]);
  }

  // Log deployment info
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", networkName);
  console.log("Deployer:", deployer.address);
  console.log("LuckyOne:", lotteryAddress);
  console.log("VRF Coordinator:", vrfCoordinator);
  console.log("Subscription ID:", subscriptionId);
  console.log("Gas Lane:", gasLane);
  console.log("Callback Gas Limit:", callbackGasLimit);
  
  // Get current lottery info
  const currentRoundId = await lottery.getCurrentRoundId();
  const ticketPrice = await lottery.getTicketPrice();
  const lotteryDuration = await lottery.getLotteryDuration();
  
  console.log("\n=== Lottery Configuration ===");
  console.log("Current Round ID:", currentRoundId.toString());
  console.log("Ticket Price:", ethers.formatEther(ticketPrice), "ETH");
  console.log("Lottery Duration:", lotteryDuration.toString(), "seconds");
  console.log("Max Tickets Per Purchase:", (await lottery.getMaxTicketsPerPurchase()).toString());

  // Save deployment addresses
  const deploymentInfo = {
    network: networkName,
    lotteryAddress,
    vrfCoordinator,
    subscriptionId: subscriptionId.toString(),
    gasLane,
    callbackGasLimit: callbackGasLimit,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };

  const fs = require('fs');
  const deploymentFile = `deployments/${networkName}.json`;
  
  if (!fs.existsSync('deployments')) {
    fs.mkdirSync('deployments');
  }
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });