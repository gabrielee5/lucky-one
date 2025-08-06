const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const [claimer] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  console.log("🏆 === CLAIM LOTTERY PRIZE ===");
  console.log(`📍 Network: ${networkName}`);
  console.log(`👤 Claimer: ${claimer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await claimer.provider.getBalance(claimer.address))} POL`);
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
  
  console.log("🔍 Scanning for claimable prizes...");
  console.log(`📊 Current Round: ${currentRoundId.toString()}`);
  console.log();
  
  // Find all rounds where user won and hasn't claimed
  const claimableRounds = [];
  
  for (let roundId = 1n; roundId < currentRoundId; roundId++) {
    try {
      const [, , , , prizePool, winner, ended, prizeClaimed] = await lottery.getLotteryRound(roundId);
      
      // Check if this user won this round and hasn't claimed
      if (winner.toLowerCase() === claimer.address.toLowerCase() && 
          !prizeClaimed && 
          ended && 
          prizePool > 0n) {
        claimableRounds.push({ roundId, prizePool });
      }
    } catch (error) {
      // Skip rounds that don't exist or have errors
      continue;
    }
  }
  
  if (claimableRounds.length === 0) {
    console.log("📊 SCAN RESULTS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("❌ No claimable prizes found!");
    console.log();
    console.log("This means:");
    console.log("  • You haven't won any lottery rounds yet, OR");
    console.log("  • You have already claimed all your prizes, OR");
    console.log("  • Winners are still being selected for recent rounds");
    console.log();
    console.log("💡 Tips:");
    console.log("  • Buy more tickets to increase your chances!");
    console.log("  • Check back later if recent rounds ended");
    console.log("  • Use 'npm run status' to check current lottery status");
    return;
  }
  
  // Calculate total claimable amount
  const totalClaimable = claimableRounds.reduce((sum, round) => sum + round.prizePool, 0n);
  
  console.log("🎉 CLAIMABLE PRIZES FOUND!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🏆 Winning Rounds: ${claimableRounds.length}`);
  console.log(`💰 Total Prize Amount: ${ethers.formatEther(totalClaimable)} POL`);
  console.log();
  
  // Show details for each claimable round
  console.log("📋 PRIZE DETAILS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  for (const round of claimableRounds) {
    console.log(`🎯 Round ${round.roundId.toString()}: ${ethers.formatEther(round.prizePool)} POL`);
  }
  console.log();
  
  // If multiple prizes, ask user or claim all
  let roundsToClaim = claimableRounds;
  
  if (claimableRounds.length > 1) {
    console.log("🎁 MULTIPLE PRIZES DETECTED!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`You have ${claimableRounds.length} unclaimed prizes!`);
    console.log("Will claim all prizes in sequence...");
    console.log();
  }
  // Claim all prizes
  let totalClaimed = 0n;
  let successfulClaims = [];
  let failedClaims = [];
  
  for (const { roundId, prizePool } of roundsToClaim) {
    console.log(`🎯 Claiming Round ${roundId.toString()} (${ethers.formatEther(prizePool)} POL)...`);
    
    try {
      // Get round details for display
      const [, startTime, endTime, totalTickets] = await lottery.getLotteryRound(roundId);
      const playerTickets = await lottery.getPlayerTickets(claimer.address, roundId);
      
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📊 Round ${roundId.toString()} Details:`);
      console.log(`   🚀 Started: ${new Date(Number(startTime) * 1000).toLocaleString()}`);
      console.log(`   ⏰ Ended: ${new Date(Number(endTime) * 1000).toLocaleString()}`);
      console.log(`   🎟️  Your Tickets: ${playerTickets.toString()} / ${totalTickets.toString()}`);
      
      if (totalTickets > 0n) {
        const winChance = (Number(playerTickets) / Number(totalTickets)) * 100;
        console.log(`   🎯 Your Win Chance: ${winChance.toFixed(2)}%`);
      }
      
      console.log(`   💰 Prize Amount: ${ethers.formatEther(prizePool)} POL`);
      console.log();
      
      // Estimate gas for this transaction
      let gasEstimate;
      try {
        gasEstimate = await lottery.claimPrize.estimateGas(roundId);
        console.log(`   ⛽ Estimated Gas: ${gasEstimate.toString()}`);
        console.log(`   💸 Estimated Cost: ~${ethers.formatEther(gasEstimate * 35000000000n)} POL`);
      } catch (gasError) {
        console.warn(`   ⚠️  Could not estimate gas for round ${roundId}`);
      }
      
      // Submit transaction
      console.log(`   🚀 Submitting claim transaction...`);
      const tx = await lottery.claimPrize(roundId);
      
      console.log(`   📄 Transaction hash: ${tx.hash}`);
      console.log(`   ⏳ Waiting for confirmation...`);
      
      const receipt = await tx.wait();
      
      console.log(`   ✅ Successfully claimed Round ${roundId.toString()}!`);
      console.log(`   💰 Prize: ${ethers.formatEther(prizePool)} POL`);
      console.log(`   ⛽ Gas Used: ${receipt.gasUsed.toString()}`);
      
      if (networkName === 'polygon') {
        console.log(`   🔗 View: https://polygonscan.com/tx/${receipt.hash}`);
      }
      
      totalClaimed += prizePool;
      successfulClaims.push({ roundId, prizePool, txHash: receipt.hash });
      
    } catch (error) {
      console.error(`   ❌ Failed to claim Round ${roundId.toString()}: ${error.message}`);
      failedClaims.push({ roundId, prizePool, error: error.message });
    }
    
    console.log();
  }
  
  // Final summary
  console.log("🏁 CLAIMING COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  if (successfulClaims.length > 0) {
    console.log(`✅ Successfully Claimed: ${successfulClaims.length} prizes`);
    console.log(`💰 Total Amount Claimed: ${ethers.formatEther(totalClaimed)} POL`);
    
    console.log();
    console.log("📋 Claimed Prizes:");
    for (const claim of successfulClaims) {
      console.log(`   🎯 Round ${claim.roundId.toString()}: ${ethers.formatEther(claim.prizePool)} POL`);
    }
  }
  
  if (failedClaims.length > 0) {
    console.log();
    console.log(`❌ Failed Claims: ${failedClaims.length}`);
    for (const fail of failedClaims) {
      console.log(`   🎯 Round ${fail.roundId.toString()}: ${fail.error}`);
    }
    console.log();
    console.log("💡 You can run this script again to retry failed claims");
  }
  
  if (successfulClaims.length > 0) {
    // Show updated balance
    const finalBalance = await claimer.provider.getBalance(claimer.address);
    console.log();
    console.log(`💰 Updated Balance: ${ethers.formatEther(finalBalance)} POL`);
    
    console.log();
    console.log("🎊 CONGRATULATIONS!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("You have successfully claimed your lottery prizes!");
    console.log("Don't forget to participate in future lottery rounds!");
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log("🏆 Claim Lottery Prize (Auto-Detection)");
  console.log();
  console.log("Description:");
  console.log("  Automatically scans all past lottery rounds to find unclaimed prizes");
  console.log("  for your address and claims them all in sequence.");
  console.log();
  console.log("Usage:");
  console.log("  npm run claim-prize");
  console.log();
  console.log("Features:");
  console.log("  • AutoPOL detection of all claimable prizes");
  console.log("  • Claims multiple prizes in a single run");
  console.log("  • Detailed reporting of claimed amounts");
  console.log("  • Retry failed claims on subsequent runs");
  console.log();
  console.log("Requirements (automatically checked):");
  console.log("  • You must be the winner of the round(s)");
  console.log("  • Winner must have been selected (VRF completed)");
  console.log("  • Prize must not have been claimed yet");
  console.log("  • Lottery round must be ended");
  console.log();
  console.log("Examples:");
  console.log("  npm run claim-prize                    # Auto-detect and claim all prizes");
  console.log();
  console.log("Tips:");
  console.log("  • Run regularly to claim new prizes as they become available");
  console.log("  • Check current lottery status: npm run status");
  console.log("  • View your lottery history: npm run player-info");
  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });