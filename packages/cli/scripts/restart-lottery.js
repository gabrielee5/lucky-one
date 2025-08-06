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
  
  // Get current lottery info
  const currentRoundId = await lottery.getCurrentRoundId();
  const targetRound = Number(currentRoundId);
  
  console.log(`🎯 Current Round: ${targetRound}`);
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
  
  // Validation checks
  console.log("🔍 RESTART VALIDATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  let canRestart = true;
  const issues = [];
  
  // Check 1: Time requirement
  if (timeRemaining > 0) {
    canRestart = false;
    issues.push("❌ Lottery period not over yet");
    console.log(`❌ Time Check: ${Math.ceil(timeRemaining / 60)} minutes remaining`);
  } else {
    console.log("✅ Time Check: Lottery period has ended");
  }
  
  // Check 2: Already ended
  if (ended) {
    canRestart = false;
    issues.push("❌ Lottery already ended");
    console.log("❌ Status Check: Lottery already ended");
  } else {
    console.log("✅ Status Check: Lottery not yet ended");
  }
  
  // Check 3: No tickets sold (this is the key requirement for restart)
  if (totalTickets === 0n) {
    console.log("✅ Tickets Check: No tickets sold (restart eligible)");
  } else {
    canRestart = false;
    issues.push(`❌ Cannot restart lottery with ${totalTickets.toString()} tickets sold`);
    console.log(`❌ Tickets Check: ${totalTickets.toString()} tickets sold - use end-lottery instead`);
  }
  
  console.log();
  
  if (!canRestart) {
    console.log("❌ RESTART NOT POSSIBLE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("The following issues prevent restarting:");
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log();
    console.log("💡 SUGGESTIONS:");
    if (timeRemaining > 0) {
      console.log("   ⏰ Wait for the lottery period to end");
    }
    if (totalTickets > 0n) {
      console.log("   🎲 Use 'npm run end-lottery' instead to select a winner");
    }
    if (ended) {
      console.log("   🔍 Check 'npm run status' for current round information");
    }
    return;
  }
  
  console.log("✅ RESTART CONDITIONS MET");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("This lottery round can be restarted because:");
  console.log("   ✅ Lottery period has ended");
  console.log("   ✅ Lottery has not been ended yet");
  console.log("   ✅ No tickets were sold");
  console.log();
  
  console.log("🔄 RESTARTING LOTTERY...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  try {
    // Estimate gas for restart
    let gasEstimate;
    try {
      gasEstimate = await lottery.restartLottery.estimateGas();
      console.log(`⛽ Estimated Gas: ${gasEstimate.toString()}`);
      console.log(`💸 Estimated Cost: ~${ethers.formatEther(gasEstimate * 35000000000n)} POL`);
    } catch (gasError) {
      console.warn(`⚠️  Could not estimate gas: ${gasError.message}`);
    }
    
    console.log();
    console.log("🚀 Submitting restart transaction...");
    
    // Submit restart transaction
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
    
    if (error.message.includes("Lottery period not over")) {
      console.log();
      console.log("💡 SOLUTION: Wait for the lottery period to end");
      console.log(`   Time remaining: ${Math.ceil(timeRemaining / 60)} minutes`);
    } else if (error.message.includes("Lottery already ended")) {
      console.log();
      console.log("💡 SOLUTION: Check current status with 'npm run status'");
    } else if (error.message.includes("Cannot restart lottery with participants")) {
      console.log();
      console.log("💡 SOLUTION: Use 'npm run end-lottery' to end lottery with participants");
    }
    
    console.log();
    console.log("🔍 Debug Information:");
    console.log(`   Current Round: ${targetRound}`);
    console.log(`   Time Remaining: ${timeRemaining}s`);
    console.log(`   Total Tickets: ${totalTickets.toString()}`);
    console.log(`   Already Ended: ${ended}`);
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