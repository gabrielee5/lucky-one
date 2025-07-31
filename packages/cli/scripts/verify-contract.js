const { run } = require("hardhat");

async function main() {
  const networkName = hre.network.name;
  console.log(`🔍 Verifying contract on ${networkName}...`);

  // Load deployment info
  const fs = require('fs');
  const deploymentFile = `deployments/${networkName}.json`;
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ No deployment found for ${networkName}.`);
    return;
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  console.log(`📋 Contract: ${deploymentInfo.lotteryAddress}`);
  console.log(`🔧 VRF Coordinator: ${deploymentInfo.vrfCoordinator}`);
  console.log(`🎫 Subscription ID: ${deploymentInfo.subscriptionId}`);
  console.log(`⛽ Gas Lane: ${deploymentInfo.gasLane}`);
  console.log(`🔥 Callback Gas Limit: ${deploymentInfo.callbackGasLimit}`);
  
  try {
    await run("verify:verify", {
      address: deploymentInfo.lotteryAddress,
      constructorArguments: [
        deploymentInfo.vrfCoordinator,
        deploymentInfo.subscriptionId,
        deploymentInfo.gasLane,
        deploymentInfo.callbackGasLimit
      ],
    });
    
    console.log("✅ Contract verified successfully!");
    
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      
      // Provide manual verification instructions
      console.log("\n🔧 Manual Verification Instructions:");
      console.log("1. Go to: https://amoy.polygonscan.com/verifyContract");
      console.log("2. Enter contract address:", deploymentInfo.lotteryAddress);
      console.log("3. Select compiler version: 0.8.20");
      console.log("4. Select optimization: Yes (1000 runs)");
      console.log("5. Paste the flattened contract code");
      console.log("\nTo get flattened code, run:");
      console.log("npx hardhat flatten contracts/LuckyOne.sol");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });