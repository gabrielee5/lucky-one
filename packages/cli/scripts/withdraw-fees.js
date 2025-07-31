const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const [owner] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  console.log("💰 === WITHDRAW OWNER FEES ===");
  console.log(`📍 Network: ${networkName}`);
  console.log(`👤 Account: ${owner.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await owner.provider.getBalance(owner.address))} MATIC`);
  console.log();

  // Load deployment info
  const deploymentFile = `deployments/${networkName}.json`;
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ No deployment found for ${networkName}. Please deploy first.`);
    return;
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const lottery = await ethers.getContractAt("LuckyOne", deploymentInfo.lotteryAddress);
  
  // Check if user is the owner
  const contractOwner = await lottery.getOwner();
  const isOwner = contractOwner.toLowerCase() === owner.address.toLowerCase();
  
  console.log("🏛️  CONTRACT OWNERSHIP");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📋 Contract Address: ${deploymentInfo.lotteryAddress}`);
  console.log(`👑 Contract Owner: ${contractOwner}`);
  console.log(`👤 Your Address: ${owner.address}`);
  console.log(`✅ You are owner: ${isOwner ? '✅ Yes' : '❌ No'}`);
  console.log();
  
  if (!isOwner) {
    console.error("❌ ACCESS DENIED");
    console.error("Only the contract owner can withdraw fees.");
    console.log(`💡 Current owner: ${contractOwner}`);
    return;
  }
  
  // Get accumulated fees
  let accumulatedFees;
  try {
    accumulatedFees = await lottery.getAccumulatedFees();
  } catch (error) {
    console.error("❌ Failed to get accumulated fees:", error.message);
    return;
  }
  
  // Get contract balance for context
  const contractBalance = await lottery.getContractBalance();
  
  console.log("💰 FEE INFORMATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🏦 Contract Balance: ${ethers.formatEther(contractBalance)} MATIC`);
  console.log(`💰 Accumulated Fees: ${ethers.formatEther(accumulatedFees)} MATIC`);
  console.log(`📊 Fee Percentage: 5% of all ticket sales`);
  console.log();
  
  if (accumulatedFees === 0n) {
    console.log("ℹ️  NO FEES TO WITHDRAW");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("No fees have been accumulated yet.");
    console.log("Fees are collected as 5% of each ticket purchase.");
    console.log();
    console.log("💡 To accumulate fees:");
    console.log("   • Players need to buy tickets");
    console.log("   • Each ticket purchase contributes 5% to owner fees");
    console.log("   • Check current lottery status: npm run status:amoy");
    return;
  }
  
  // Calculate what percentage of contract balance is fees
  const feePercentageOfBalance = contractBalance > 0n 
    ? (Number(accumulatedFees) / Number(contractBalance)) * 100 
    : 0;
  
  console.log("📊 WITHDRAWAL DETAILS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`💸 Amount to withdraw: ${ethers.formatEther(accumulatedFees)} MATIC`);
  console.log(`📈 Fee percentage of contract: ${feePercentageOfBalance.toFixed(2)}%`);
  console.log(`💰 Your balance after: ~${ethers.formatEther(await owner.provider.getBalance(owner.address) + accumulatedFees)} MATIC`);
  console.log();
  
  // Show gas estimate
  try {
    const gasEstimate = await lottery.withdrawFees.estimateGas();
    console.log("⛽ TRANSACTION DETAILS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`⛽ Estimated Gas: ${gasEstimate.toString()}`);
    console.log(`💸 Estimated Cost: ~${ethers.formatEther(gasEstimate * 35000000000n)} MATIC`);
    console.log();
  } catch (error) {
    console.warn("⚠️  Could not estimate gas");
  }
  
  try {
    console.log("🚀 Submitting fee withdrawal transaction...");
    const tx = await lottery.withdrawFees();
    
    console.log(`📄 Transaction hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    console.log();
    console.log("✅ FEES WITHDRAWN SUCCESSFULLY!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`💰 Amount Withdrawn: ${ethers.formatEther(accumulatedFees)} MATIC`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`🔗 Transaction: ${receipt.hash}`);
    
    // Get updated balances
    const newBalance = await owner.provider.getBalance(owner.address);
    const newContractBalance = await lottery.getContractBalance();
    const remainingFees = await lottery.getAccumulatedFees();
    
    console.log();
    console.log("📊 UPDATED BALANCES");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`💰 Your New Balance: ${ethers.formatEther(newBalance)} MATIC`);
    console.log(`🏦 Contract Balance: ${ethers.formatEther(newContractBalance)} MATIC`);
    console.log(`💰 Remaining Fees: ${ethers.formatEther(remainingFees)} MATIC`);
    
    // Look for FeeWithdrawn event
    const feeWithdrawnEvent = receipt.logs.find(log => {
      try {
        const decoded = lottery.interface.parseLog(log);
        return decoded.name === 'FeeWithdrawn';
      } catch {
        return false;
      }
    });
    
    if (feeWithdrawnEvent) {
      const decoded = lottery.interface.parseLog(feeWithdrawnEvent);
      console.log(`🎯 Event Amount: ${ethers.formatEther(decoded.args.amount)} MATIC`);
    }
    
    console.log();
    console.log("🎉 SUCCESS!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Owner fees have been successfully withdrawn!");
    console.log("New fees will accumulate as players continue buying tickets.");
    console.log();
    
    if (networkName === 'polygonAmoy') {
      console.log(`🔗 View transaction: https://amoy.polygonscan.com/tx/${receipt.hash}`);
    } else if (networkName === 'polygon') {
      console.log(`🔗 View transaction: https://polygonscan.com/tx/${receipt.hash}`);
    }
    
  } catch (error) {
    console.error("❌ TRANSACTION FAILED!");
    console.error("Error:", error.message);
    
    if (error.message.includes("Not the contract owner")) {
      console.log("💡 Tip: Only the contract owner can withdraw fees");
    } else if (error.message.includes("No fees to withdraw")) {
      console.log("💡 Tip: No fees have been accumulated yet");
    }
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log("💰 Withdraw Owner Fees");
  console.log();
  console.log("Description:");
  console.log("  Withdraws accumulated owner fees from the lottery contract.");
  console.log("  Fees are collected as 5% of each ticket purchase.");
  console.log("  Only the contract owner can withdraw fees.");
  console.log();
  console.log("Usage:");
  console.log("  npm run withdraw-fees:amoy");
  console.log("  npm run withdraw-fees:polygon");
  console.log();
  console.log("Options:");
  console.log("  --help, -h     Show this help message");
  console.log();
  console.log("Requirements:");
  console.log("  • Must be called by the contract owner");
  console.log("  • There must be accumulated fees to withdraw");
  console.log("  • Contract must have sufficient balance");
  console.log();
  console.log("Fee System:");
  console.log("  • 5% of each ticket purchase goes to owner fees");
  console.log("  • 95% goes to the prize pool");
  console.log("  • Fees accumulate until withdrawn by owner");
  console.log("  • Owner can withdraw fees at any time");
  console.log();
  console.log("Examples:");
  console.log("  npm run withdraw-fees:amoy     # Withdraw fees on Amoy testnet");
  console.log("  npm run withdraw-fees:polygon  # Withdraw fees on Polygon mainnet");
  console.log();
  console.log("Tips:");
  console.log("  • Check accumulated fees with: npm run status:amoy");
  console.log("  • Fees accumulate automatically as tickets are sold");
  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });