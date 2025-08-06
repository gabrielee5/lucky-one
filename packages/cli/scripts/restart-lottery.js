const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const [signer] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  console.log("🔄 === RESTART LOTTERY ROUND ===");
  console.log(`📍 Network: ${networkName}`);
  console.log(`👤 Caller: ${signer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await signer.provider.getBalance(signer.address))} POL`);
  console.log();

  // Load deployment info
  const deploymentFile = `deployments/${networkName}.json`;
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ No deployment found for ${networkName}. Please deploy first.`);
    return;
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const lottery = await ethers.getContractAt("LuckyOne", deploymentInfo.lotteryAddress);
  
  // Get current lottery info for display only
  const currentRoundId = await lottery.getCurrentRoundId();
  const targetRound = Number(currentRoundId);
  
  console.log(`🎯 Current Round: ${targetRound}`);
  console.log();
  
  // Get round info for display
  const [, startTime, endTime, totalTickets, prizePool, winner, ended, prizeClaimed, state] = 
    await lottery.getLotteryRound(targetRound);
  
  // Use blockchain time for display
  const currentBlock = await signer.provider.getBlock('latest');
  const blockTimestamp = currentBlock.timestamp;
  const timeRemaining = Number(endTime) - blockTimestamp;
  
  console.log("📊 LOTTERY ROUND STATUS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🚀 Started: ${new Date(Number(startTime) * 1000).toLocaleString()}`);
  console.log(`⏰ End Time: ${new Date(Number(endTime) * 1000).toLocaleString()}`);
  console.log(`🔗 Blockchain Time: ${new Date(blockTimestamp * 1000).toLocaleString()}`);
  
  if (timeRemaining > 0) {
    const days = Math.floor(timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
    console.log(`⏳ Time Remaining: ${days}d ${hours}h ${minutes}m`);
  } else {
    console.log("⏳ Time Remaining: EXPIRED ✅");
  }
  
  console.log(`🎟️  Total Tickets: ${totalTickets.toString()}`);
  console.log(`💰 Prize Pool: ${ethers.formatEther(prizePool)} POL`);
  console.log(`📊 Status: ${state === 0n ? '🟢 OPEN' : state === 1n ? '🟡 CALCULATING' : '🔴 CLOSED'}`);
  console.log();
  
  console.log("🚀 Attempting restart (let contract validate conditions)...");
  console.log();
  
  try {
    // Submit restart transaction directly - let contract handle validation
    console.log("🚀 Submitting restart transaction...");
    const tx = await lottery.restartLottery();
    
    console.log(`📄 Transaction Hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    console.log("✅ LOTTERY RESTARTED SUCCESSFULLY!");
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    
    if (networkName === 'polygon') {
      console.log(`🔗 View: https://polygonscan.com/tx/${receipt.hash}`);
    } else if (networkName === 'polygonAmoy') {
      console.log(`🔗 View: https://amoy.polygonscan.com/tx/${receipt.hash}`);
    }
    
    console.log();
    
    // Check for restart event
    const restartEvent = receipt.logs.find(log => {
      try {
        const decoded = lottery.interface.parseLog(log);
        return decoded.name === 'LotteryRestarted';
      } catch {
        return false;
      }
    });
    
    if (restartEvent) {
      const decoded = lottery.interface.parseLog(restartEvent);
      console.log("📋 RESTART DETAILS");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`🔄 Old Round ID: ${decoded.args.oldRoundId.toString()}`);
      console.log(`🆕 New Round ID: ${decoded.args.newRoundId.toString()}`);
    }
    
    // Get new round information
    const newCurrentRoundId = await lottery.getCurrentRoundId();
    const newRoundInfo = await lottery.getLotteryRound(Number(newCurrentRoundId));
    const [newRoundId, newStartTime, newEndTime] = newRoundInfo;
    
    console.log();
    console.log("🎯 NEW LOTTERY ROUND");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🆔 Round ID: ${newRoundId.toString()}`);
    console.log(`🚀 Started: ${new Date(Number(newStartTime) * 1000).toLocaleString()}`);
    console.log(`⏰ Ends: ${new Date(Number(newEndTime) * 1000).toLocaleString()}`);
    
    const duration = Number(newEndTime) - Number(newStartTime);
    const durationHours = duration / 3600;
    console.log(`⏱️  Duration: ${durationHours} hours`);
    
    console.log();
    console.log("🎉 SUCCESS! The lottery has been restarted with a fresh round.");
    console.log("💡 Players can now start buying tickets for the new round!");
    
    console.log();
    console.log("📋 NEXT STEPS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🛒 Buy tickets: npm run buy-tickets");
    console.log("📊 Check status: npm run status");
    console.log("👥 Check player info: npm run player-info");
    
  } catch (error) {
    console.error("❌ RESTART FAILED");
    console.error(`Error: ${error.message}`);
    console.log();
    
    // Provide helpful suggestions based on error message
    if (error.message.includes("Lottery period not over")) {
      console.log("💡 SOLUTION: Wait for the lottery period to end");
      if (timeRemaining > 0) {
        console.log(`   ⏰ Time remaining: ${Math.ceil(timeRemaining / 60)} minutes`);
      }
    } else if (error.message.includes("Lottery already ended")) {
      console.log("💡 SOLUTION: Lottery was already processed");
      console.log("   🔍 Check 'npm run status' for current round information");
      console.log("   🎯 Try 'npm run start-lottery' to begin a new round");
    } else if (error.message.includes("Cannot restart lottery with participants") || error.message.includes("tickets")) {
      console.log("💡 SOLUTION: Lottery has participants");
      console.log("   🎲 Use 'npm run end-lottery' to select a winner instead");
    } else {
      console.log("💡 SUGGESTIONS:");
      console.log("   🔍 Check 'npm run status' for current lottery state");
      console.log("   📖 Run with --help for more information");
    }
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log("🔄 Restart Lottery Round");
  console.log();
  console.log("Description:");
  console.log("  Restarts the current lottery round when no tickets were sold.");
  console.log("  This creates a fresh round instead of selecting a winner from zero participants.");
  console.log();
  console.log("Usage:");
  console.log("  npm run restart-lottery");
  console.log();
  console.log("Requirements (automatically checked):");
  console.log("  • Lottery period must be over (time expired)");
  console.log("  • Lottery must not have been ended yet");
  console.log("  • No tickets must have been sold (totalTickets = 0)");
  console.log();
  console.log("What happens:");
  console.log("  • Current round is marked as ended (no winner selected)");
  console.log("  • A new lottery round is automatically started");
  console.log("  • New round gets a fresh timer and accepts new ticket purchases");
  console.log();
  console.log("Alternative Commands:");
  console.log("  npm run end-lottery    # End lottery with participants (selects winner)");
  console.log("  npm run status         # Check current lottery status");
  console.log();
  console.log("Examples:");
  console.log("  npm run restart-lottery          # Restart current round if eligible");
  console.log();
  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });