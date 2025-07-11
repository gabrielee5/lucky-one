const { ethers } = require("hardhat");
const { verify } = require("../utils/verify");

const SEPOLIA_VRF_COORDINATOR = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";
const SEPOLIA_GAS_LANE = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
const CALLBACK_GAS_LIMIT = 500000;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  const networkName = hre.network.name;
  console.log("Network:", networkName);

  let vrfCoordinator, subscriptionId, gasLane;

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
    
    console.log("Mock VRF Coordinator deployed to:", vrfCoordinator);
    console.log("Subscription ID:", subscriptionId);
    
  } else if (networkName === "sepolia") {
    console.log("Deploying to Sepolia testnet");
    
    vrfCoordinator = SEPOLIA_VRF_COORDINATOR;
    subscriptionId = process.env.VRF_SUBSCRIPTION_ID;
    gasLane = SEPOLIA_GAS_LANE;
    
    if (!subscriptionId) {
      throw new Error("VRF_SUBSCRIPTION_ID not set in environment variables");
    }
    
    console.log("Using Sepolia VRF Coordinator:", vrfCoordinator);
    console.log("Subscription ID:", subscriptionId);
    
  } else {
    throw new Error(`Unsupported network: ${networkName}`);
  }

  // Deploy DecentralizedLottery
  console.log("Deploying DecentralizedLottery...");
  const DecentralizedLottery = await ethers.getContractFactory("DecentralizedLottery");
  const lottery = await DecentralizedLottery.deploy(
    vrfCoordinator,
    subscriptionId,
    gasLane,
    CALLBACK_GAS_LIMIT
  );

  await lottery.waitForDeployment();
  const lotteryAddress = await lottery.getAddress();
  console.log("DecentralizedLottery deployed to:", lotteryAddress);

  // Add consumer to VRF subscription for local networks
  if (networkName === "hardhat" || networkName === "localhost") {
    const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinator);
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, lotteryAddress);
    console.log("Added lottery contract as VRF consumer");
  }

  // Verify contract on Etherscan for testnet/mainnet
  if (networkName === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await lottery.deploymentTransaction().wait(6);
    
    console.log("Verifying contract on Etherscan...");
    await verify(lotteryAddress, [vrfCoordinator, subscriptionId, gasLane, CALLBACK_GAS_LIMIT]);
  }

  // Log deployment info
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", networkName);
  console.log("Deployer:", deployer.address);
  console.log("DecentralizedLottery:", lotteryAddress);
  console.log("VRF Coordinator:", vrfCoordinator);
  console.log("Subscription ID:", subscriptionId);
  console.log("Gas Lane:", gasLane);
  console.log("Callback Gas Limit:", CALLBACK_GAS_LIMIT);
  
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
    callbackGasLimit: CALLBACK_GAS_LIMIT,
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