const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const [claimer] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  // Get parameters from environment variables
  const roundId = process.env.ROUND;
  
  console.log("🏆 === CLAIM LOTTERY PRIZE ===");
  console.log(`📍 Network: ${networkName}`);
  console.log(`👤 Claimer: ${claimer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await claimer.provider.getBalance(claimer.address))} MATIC`);
  console.log();

  if (!roundId) {
    console.error("❌ Round ID is required. Use --round=N");
    console.log("💡 Use 'npm run claim-prize:amoy -- --round=1' to claim prize for round 1");
    return;
  }

  const targetRound = BigInt(roundId);
  console.log(`🎯 Target Round: ${targetRound.toString()}`);
  console.log();

  // Load deployment info
  const deploymentFile = `packages/cli/deployments/${networkName}.json`;
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ No deployment found for ${networkName}. Please deploy first.`);
    return;
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const lottery = await ethers.getContractAt("DecentralizedLottery", deploymentInfo.lotteryAddress);
  
  // Get current lottery info
  const currentRoundId = await lottery.getCurrentRoundId();
  
  // Check if round exists
  if (targetRound > currentRoundId) {
    console.error(`❌ Round ${targetRound} doesn't exist yet. Current round: ${currentRoundId}`);
    return;
  }
  
  // Get round info
  const [, startTime, endTime, totalTickets, prizePool, winner, ended, prizeClaimed, state] = 
    await lottery.getLotteryRound(targetRound);
  
  console.log("📊 LOTTERY ROUND INFO");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🎯 Round: ${targetRound.toString()}`);
  console.log(`🚀 Started: ${new Date(Number(startTime) * 1000).toLocaleString()}`);
  console.log(`⏰ Ended: ${new Date(Number(endTime) * 1000).toLocaleString()}`);
  console.log(`🎟️  Total Tickets: ${totalTickets.toString()}`);
  console.log(`💰 Prize Pool: ${ethers.formatEther(prizePool)} MATIC`);
  console.log(`📊 Status: ${state === 0n ? '🟢 OPEN' : state === 1n ? '🟡 CALCULATING' : '🔴 CLOSED'}`);
  console.log(`🏁 Lottery Ended: ${ended ? '✅ Yes' : '❌ No'}`);
  
  if (winner !== ethers.ZeroAddress) {
    console.log(`🏆 Winner: ${winner}`);
    console.log(`🎁 Prize Claimed: ${prizeClaimed ? '✅ Yes' : '❌ No'}`);
    
    // Check if the claimer is the winner
    if (winner.toLowerCase() === claimer.address.toLowerCase()) {
      console.log(`🎉 YOU ARE THE WINNER!`);
    } else {
      console.log(`❌ You are not the winner of this round`);
    }
  } else {
    console.log(`🏆 Winner: ⏳ Not yet selected`);
  }
  
  console.log();
  
  // Check if prize can be claimed
  let canClaim = true;
  let errors = [];
  
  if (winner === ethers.ZeroAddress) {
    canClaim = false;
    errors.push("Winner has not been selected yet");
  }
  
  if (winner.toLowerCase() !== claimer.address.toLowerCase()) {
    canClaim = false;
    errors.push("You are not the winner of this round");
  }
  
  if (prizeClaimed) {
    canClaim = false;
    errors.push("Prize has already been claimed");
  }
  
  if (prizePool === 0n) {
    canClaim = false;
    errors.push("No prize pool available");
  }
  
  if (!ended) {
    canClaim = false;
    errors.push("Lottery round has not ended yet");
  }
  
  if (!canClaim) {
    console.log("❌ CANNOT CLAIM PRIZE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    errors.forEach(error => console.log(`   • ${error}`));
    
    if (winner === ethers.ZeroAddress && ended) {
      console.log();
      console.log("💡 The lottery has ended but winner selection is pending.");
      console.log("   This happens when Chainlink VRF is processing the random number.");
      console.log("   Please wait a few minutes and try again.");
    }
    
    if (winner.toLowerCase() !== claimer.address.toLowerCase() && winner !== ethers.ZeroAddress) {
      console.log();
      console.log(`💡 The winner is: ${winner}`);
      console.log("   Only the winner can claim the prize.");
    }
    
    return;
  }
  
  // Show claim details
  console.log("🎁 PRIZE CLAIM DETAILS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`💰 Prize Amount: ${ethers.formatEther(prizePool)} MATIC`);
  console.log(`🏆 Winner: ${winner} (YOU!)`);
  
  // Get player's tickets info
  const playerTickets = await lottery.getPlayerTickets(claimer.address, targetRound);
  console.log(`🎟️  Your Tickets: ${playerTickets.toString()}`);
  
  if (totalTickets > 0n) {
    const winChance = (Number(playerTickets) / Number(totalTickets)) * 100;
    console.log(`🎯 Your Win Chance Was: ${winChance.toFixed(2)}%`);
  }
  
  console.log();
  
  // Show gas estimate
  try {
    const gasEstimate = await lottery.claimPrize.estimateGas(targetRound);
    console.log("⛽ TRANSACTION DETAILS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`⛽ Estimated Gas: ${gasEstimate.toString()}`);
    console.log(`💸 Estimated Cost: ~${ethers.formatEther(gasEstimate * 35000000000n)} MATIC`);
    console.log();
  } catch (error) {
    console.warn("⚠️  Could not estimate gas");
  }
  
  try {
    console.log("🚀 Submitting prize claim transaction...");
    const tx = await lottery.claimPrize(targetRound);
    
    console.log(`📄 Transaction hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    console.log();
    console.log("🎉 PRIZE CLAIMED SUCCESSFULLY!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🏆 Round ${targetRound} prize claimed!`);
    console.log(`💰 Prize Amount: ${ethers.formatEther(prizePool)} MATIC`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`🔗 Transaction: ${receipt.hash}`);
    
    // Get updated balance
    const newBalance = await claimer.provider.getBalance(claimer.address);
    console.log(`💰 New Balance: ${ethers.formatEther(newBalance)} MATIC`);
    
    // Look for PrizeClaimed event
    const prizeClaimedEvent = receipt.logs.find(log => {
      try {
        const decoded = lottery.interface.parseLog(log);
        return decoded.name === 'PrizeClaimed';
      } catch {
        return false;
      }
    });
    
    if (prizeClaimedEvent) {
      const decoded = lottery.interface.parseLog(prizeClaimedEvent);
      console.log(`🎯 Claimed Amount: ${ethers.formatEther(decoded.args.amount)} MATIC`);
    }
    
    console.log();
    console.log("🎊 CONGRATULATIONS!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("You have successfully claimed your lottery prize!");
    console.log("Don't forget to participate in future lottery rounds!");
    console.log();
    
    if (networkName === 'polygonAmoy') {
      console.log(`🔗 View transaction: https://amoy.polygonscan.com/tx/${receipt.hash}`);
    } else if (networkName === 'polygon') {
      console.log(`🔗 View transaction: https://polygonscan.com/tx/${receipt.hash}`);
    }
    
  } catch (error) {
    console.error("❌ TRANSACTION FAILED!");
    console.error("Error:", error.message);
    
    if (error.message.includes("Not the winner")) {
      console.log("💡 Tip: Only the winner can claim the prize");
    } else if (error.message.includes("Prize already claimed")) {
      console.log("💡 Tip: This prize has already been claimed");
    } else if (error.message.includes("Winner not selected yet")) {
      console.log("💡 Tip: Wait for Chainlink VRF to select the winner");
    }
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log("🏆 Claim Lottery Prize");
  console.log();
  console.log("Description:");
  console.log("  Allows the winner of a lottery round to claim their prize.");
  console.log("  Only the winner can claim, and only once per round.");
  console.log();
  console.log("Usage:");
  console.log("  ROUND=1 npm run claim-prize:amoy");
  console.log("  ROUND=5 npm run claim-prize:amoy");
  console.log();
  console.log("Environment Variables:");
  console.log("  ROUND=N        Round ID to claim prize from (required)");
  console.log();
  console.log("Requirements:");
  console.log("  • You must be the winner of the specified round");
  console.log("  • Winner must have been selected (VRF completed)");
  console.log("  • Prize must not have been claimed yet");
  console.log("  • Lottery round must be ended");
  console.log();
  console.log("Examples:");
  console.log("  ROUND=1 npm run claim-prize:amoy            # Claim prize from round 1");
  console.log("  ROUND=3 npm run claim-prize:amoy            # Claim prize from round 3");
  console.log();
  console.log("Tips:");
  console.log("  • Check if you're a winner with: npm run status:amoy");
  console.log("  • Find your winning rounds with: npm run player-info:amoy");
  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });