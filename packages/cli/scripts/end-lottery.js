const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const [signer] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  // No parameters needed - always ends current round when time is up
  
  console.log("🎲 === END CURRENT LOTTERY ROUND ===");
  console.log(`📍 Network: ${networkName}`);
  console.log(`👤 Caller: ${signer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await signer.provider.getBalance(signer.address))} MATIC`);
  console.log();

  // Load deployment info
  const deploymentFile = `deployments/${networkName}.json`;
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ No deployment found for ${networkName}. Please deploy first.`);
    return;
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const lottery = await ethers.getContractAt("LuckyOne", deploymentInfo.lotteryAddress);
  
  // Get current lottery info - only allow ending current round
  const currentRoundId = await lottery.getCurrentRoundId();
  const targetRound = currentRoundId;
  
  console.log(`🎯 Current Round: ${targetRound.toString()}`);
  console.log();
  
  // Get round info
  const [, startTime, endTime, totalTickets, prizePool, winner, ended, prizeClaimed, state] = 
    await lottery.getLotteryRound(targetRound);
  
  // Use blockchain time for accuracy
  const currentBlock = await signer.provider.getBlock('latest');
  const blockTimestamp = currentBlock.timestamp;
  const timeRemaining = Number(endTime) - blockTimestamp;
  
  console.log("📊 LOTTERY ROUND STATUS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🚀 Started: ${new Date(Number(startTime) * 1000).toLocaleString()}`);
  console.log(`⏰ End Time: ${new Date(Number(endTime) * 1000).toLocaleString()}`);
  
  if (timeRemaining > 0) {
    const days = Math.floor(timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
    console.log(`⏳ Time Remaining: ${days}d ${hours}h ${minutes}m`);
  } else {
    console.log(`⏳ Time Status: ⚠️  EXPIRED (${Math.abs(Math.floor(timeRemaining / 60))} minutes ago)`);
  }
  
  console.log(`🎟️  Total Tickets: ${totalTickets.toString()}`);
  console.log(`💰 Prize Pool: ${ethers.formatEther(prizePool)} MATIC`);
  console.log(`📊 Status: ${state === 0n ? '🟢 OPEN' : state === 1n ? '🟡 CALCULATING' : '🔴 CLOSED'}`);
  console.log(`🏁 Ended: ${ended ? '✅ Yes' : '❌ No'}`);
  console.log(`🔗 Blockchain Time: ${new Date(blockTimestamp * 1000).toLocaleString()}`);
  
  if (winner !== ethers.ZeroAddress) {
    console.log(`🏆 Winner: ${winner}`);
    console.log(`🎁 Prize Claimed: ${prizeClaimed ? '✅ Yes' : '❌ No'}`);
  }
  
  console.log();
  
  // Check if lottery can be ended
  let canEnd = true;
  let errors = [];
  
  if (ended) {
    canEnd = false;
    errors.push("Lottery has already been ended");
  }
  
  if (totalTickets === 0n) {
    canEnd = false;
    errors.push("No tickets have been sold");
  }
  
  if (timeRemaining > 0) {
    canEnd = false;
    errors.push(`Lottery period not over (${Math.ceil(timeRemaining / 60)} minutes remaining)`);
  }
  
  // Only current round can be ended - this check is now redundant since targetRound = currentRoundId
  // but keeping for clarity and future-proofing
  
  if (!canEnd) {
    console.log("❌ CANNOT END LOTTERY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    errors.forEach(error => console.log(`   • ${error}`));
    
    if (timeRemaining > 0) {
      console.log();
      console.log("💡 SOLUTION:");
      console.log("   • Wait for the lottery period to end");
    }
    
    console.log();
    console.log("📊 Note: Only the current round can be ended.");
    console.log("   Past rounds cannot be ended, and future rounds don't exist yet.");
    
    return;
  }
  
  
  // Show gas estimate
  try {
    const gasEstimate = await lottery.endLottery.estimateGas();
    console.log("⛽ TRANSACTION DETAILS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`⛽ Estimated Gas: ${gasEstimate.toString()}`);
    console.log(`💸 Estimated Cost: ~${ethers.formatEther(gasEstimate * 35000000000n)} POL`);
    console.log();
  } catch (error) {
    console.warn("⚠️  Could not estimate gas");
  }
  
  try {
    console.log("🚀 Submitting end lottery transaction...");
    const tx = await lottery.endLottery();
    
    console.log(`📄 Transaction hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    console.log();
    console.log("✅ LOTTERY ENDED SUCCESSFULLY!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🎲 Round ${targetRound} ended`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`🔗 Transaction: ${receipt.hash}`);
    
    // Look for LotteryEnded event
    const lotteryEndedEvent = receipt.logs.find(log => {
      try {
        const decoded = lottery.interface.parseLog(log);
        return decoded.name === 'LotteryEnded';
      } catch {
        return false;
      }
    });
    
    if (lotteryEndedEvent) {
      const decoded = lottery.interface.parseLog(lotteryEndedEvent);
      console.log(`🎯 VRF Request ID: ${decoded.args.requestId.toString()}`);
    }
    
    console.log();
    console.log("⏳ NEXT STEPS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("• Chainlink VRF is now generating random number");
    console.log("• Winner will be selected automatically when VRF responds");
    console.log("• New lottery round will start automatically");
    console.log("• Check status with: npm run status");
    console.log();
    
    console.log("🔗 Monitor VRF Request:");
    if (networkName === 'polygonAmoy') {
      console.log("   https://vrf.chain.link/polygon-amoy");
    } else if (networkName === 'polygon') {
      console.log("   https://vrf.chain.link/polygon");
    }
    
  } catch (error) {
    console.error("❌ TRANSACTION FAILED!");
    console.error("Error:", error.message);
    
    if (error.message.includes("Lottery period not over")) {
      console.log("💡 Tip: Wait for the lottery period to end");
    } else if (error.message.includes("Lottery already ended")) {
      console.log("💡 Tip: This lottery has already been ended");
    } else if (error.message.includes("No tickets sold")) {
      console.log("💡 Tip: At least one ticket must be sold before ending");
    }
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log("🎲 End Current Lottery Round");
  console.log();
  console.log("Description:");
  console.log("  Ends the current lottery round and triggers VRF random number generation");
  console.log("  for winner selection. Anyone can call this function once the time expires.");
  console.log("  ONLY the current round can be ended - past rounds cannot be ended.");
  console.log();
  console.log("Usage:");
  console.log("  npm run end-lottery");
  console.log();
  console.log("Options:");
  console.log("  --help, -h     Show this help message");
  console.log();
  console.log("Requirements:");
  console.log("  • Must be the current active round");
  console.log("  • Lottery period must be over (1 hour from start)");
  console.log("  • At least one ticket must be sold");
  console.log("  • Lottery must not already be ended");
  console.log("  • Valid VRF subscription with LINK balance");
  console.log();
  console.log("Examples:");
  console.log("  npm run end-lottery                    # End current round");
  console.log();
  console.log("Note:");
  console.log("  • Only the current lottery round can be ended");
  console.log("  • Past rounds are automatically handled by the contract");
  console.log("  • Future rounds don't exist yet");
  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });