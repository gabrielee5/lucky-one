const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  console.log("🎰 ===== LOTTERY STATUS DASHBOARD =====");
  console.log(`📍 Network: ${networkName}`);
  console.log(`👤 Your Address: ${deployer.address}`);
  console.log(`💰 Your Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} POL`);
  console.log();

  // Load deployment info
  const fs = require('fs');
  const deploymentFile = `deployments/${networkName}.json`;
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ No deployment found for ${networkName}. Please deploy first.`);
    return;
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const lottery = await ethers.getContractAt("LuckyOne", deploymentInfo.lotteryAddress);
  
  console.log("📋 CONTRACT INFORMATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🏠 Contract Address: ${deploymentInfo.lotteryAddress}`);
  console.log(`👑 Owner: ${await lottery.getOwner()}`);
  console.log(`💎 Contract Balance: ${ethers.formatEther(await lottery.getContractBalance())} POL`);
  console.log(`🎟️  Ticket Price: ${ethers.formatEther(await lottery.getTicketPrice())} POL`);
  
  // Check if user is owner
  const isOwner = (await lottery.getOwner()).toLowerCase() === deployer.address.toLowerCase();
  if (isOwner) {
    console.log("👑 You are the owner of this lottery!");
    try {
      const accumulatedFees = await lottery.getAccumulatedFees();
      console.log(`💰 Accumulated Fees: ${ethers.formatEther(accumulatedFees)} POL`);
    } catch (error) {
      console.log("⚠️  Could not fetch accumulated fees");
    }
  }
  
  console.log();
  
  // Current lottery round info
  const currentRoundId = await lottery.getCurrentRoundId();
  console.log(`🔍 Debug: Current Round ID from contract: ${currentRoundId.toString()}`);
  
  let roundInfo;
  try {
    roundInfo = await lottery.getLotteryRound(currentRoundId);
  } catch (error) {
    console.error(`❌ Error fetching round ${currentRoundId.toString()}: ${error.message}`);
    
    // Try with previous round ID if current round fails
    if (currentRoundId > 1n) {
      console.log(`🔄 Trying previous round: ${(currentRoundId - 1n).toString()}`);
      try {
        roundInfo = await lottery.getLotteryRound(currentRoundId - 1n);
        console.log(`✅ Using round ${(currentRoundId - 1n).toString()} data`);
      } catch (prevError) {
        console.error(`❌ Previous round also failed: ${prevError.message}`);
        return;
      }
    } else {
      return;
    }
  }
  
  const [roundId, startTime, endTime, totalTickets, prizePool, winner, ended, prizeClaimed, state] = roundInfo;
  
  console.log("🎯 CURRENT LOTTERY ROUND");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔢 Round ID: ${roundId.toString()}`);
  
  // Use blockchain time for accuracy
  const currentBlock = await deployer.provider.getBlock('latest');
  const blockTimestamp = currentBlock.timestamp;
  const startTimeNum = Number(startTime);
  const endTimeNum = Number(endTime);
  
  console.log(`🚀 Started: ${new Date(startTimeNum * 1000).toLocaleString()}`);
  console.log(`⏰ Ends: ${new Date(endTimeNum * 1000).toLocaleString()}`);
  console.log(`🔗 Blockchain Time: ${new Date(blockTimestamp * 1000).toLocaleString()}`);
  
  // Calculate time remaining using blockchain time
  const timeRemaining = endTimeNum - blockTimestamp;
  if (timeRemaining > 0) {
    const days = Math.floor(timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
    console.log(`⏳ Time Remaining: ${days}d ${hours}h ${minutes}m`);
  } else {
    console.log("⏳ Time Remaining: EXPIRED (can be ended)");
  }
  
  console.log(`🎟️  Total Tickets Sold: ${totalTickets.toString()}`);
  console.log(`💰 Prize Pool: ${ethers.formatEther(prizePool)} POL`);
  
  // Determine accurate lottery state
  let actualState;
  let stateDescription;
  
  if (ended && winner !== ethers.ZeroAddress) {
    actualState = "🔴 CLOSED";
    stateDescription = "Round completed - winner selected";
  } else if (ended && winner === ethers.ZeroAddress) {
    actualState = "🟡 CALCULATING";
    stateDescription = "Waiting for VRF to select winner";
  } else if (timeRemaining <= 0 && totalTickets > 0n) {
    actualState = "⏰ READY TO END";
    stateDescription = "Time expired - can be ended";
  } else if (timeRemaining <= 0 && totalTickets === 0n) {
    actualState = "🔄 READY TO RESTART";
    stateDescription = "Time expired with no tickets - can restart";
  } else if (timeRemaining > 0) {
    actualState = "🟢 OPEN";
    stateDescription = "Active - accepting ticket purchases";
  } else {
    actualState = "❓ UNKNOWN";
    stateDescription = "Unexpected state";
  }
  
  console.log(`📊 Status: ${actualState}`);
  console.log(`📝 Description: ${stateDescription}`);
  
  // Show contract state for reference
  const contractStateNames = ["OPEN", "CALCULATING", "CLOSED"];
  console.log(`⚙️  Contract State: ${contractStateNames[Number(state)]}`);
  
  if (winner !== ethers.ZeroAddress) {
    console.log(`🏆 Winner: ${winner}`);
    console.log(`🎁 Prize Claimed: ${prizeClaimed ? "✅ Yes" : "❌ No"}`);
    
    if (winner.toLowerCase() === deployer.address.toLowerCase()) {
      console.log("🎉 CONGRATULATIONS! You are the winner!");
      if (!prizeClaimed) {
        console.log("💡 You can claim your prize with: lottery.claimPrize()");
      }
    }
  }
  
  console.log();
  
  // Your participation
  console.log("👤 YOUR PARTICIPATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  try {
    const yourTickets = await lottery.getPlayerTickets(deployer.address, roundId);
    console.log(`🎟️  Your Tickets: ${yourTickets.toString()}`);
    
    if (yourTickets > 0) {
      const yourInvestment = yourTickets * await lottery.getTicketPrice();
      console.log(`💸 Your Investment: ${ethers.formatEther(yourInvestment)} POL`);
      
      if (totalTickets > 0) {
        const winChance = (Number(yourTickets) / Number(totalTickets)) * 100;
        console.log(`🎯 Win Chance: ${winChance.toFixed(2)}%`);
      }
    }
  } catch (error) {
    console.log("⚠️  Could not fetch your ticket information");
    console.log(`   Error: ${error.message}`);
    console.log(`   Round ID used: ${roundId.toString()}`);
    console.log(`   Current Round ID: ${currentRoundId.toString()}`);
    console.log("   This might indicate a contract state issue");
  }
  
  console.log();
  
  // Recent activity
  console.log("📈 RECENT ACTIVITY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  try {
    const ticketFilter = lottery.filters.TicketsPurchased();
    const ticketEvents = await lottery.queryFilter(ticketFilter, -1000); // Last 1000 blocks
    
    console.log(`🎟️  Total Ticket Purchases: ${ticketEvents.length}`);
    
    if (ticketEvents.length > 0) {
      console.log("📊 Recent Purchases:");
      ticketEvents.slice(-5).forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.args.player.substring(0, 8)}... bought ${event.args.ticketCount} tickets`);
      });
    }
  } catch (error) {
    console.log("⚠️  Could not fetch recent activity");
  }
  
  console.log();
  
  // Action suggestions based on actual state
  console.log("💡 AVAILABLE ACTIONS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  if (actualState.includes("OPEN")) {
    console.log("🛒 Buy tickets: npm run buy-tickets");
    console.log("🎟️  Max tickets per purchase: 100");
    
    // Show fee structure
    const feeStructure = await lottery.getFeeStructure();
    const [freeTier, midTier, midFeePercent, highFeePercent] = feeStructure;
    console.log(`💰 Fee Structure: First ${freeTier} tickets (0%), Next ${midTier - freeTier} tickets (${midFeePercent/100}%), Remaining (${highFeePercent/100}%)`);
  }
  
  if (actualState.includes("READY TO END")) {
    console.log("🎲 End lottery: npm run end-lottery");
    console.log("⏰ This lottery can now be ended to select a winner");
  }
  
  if (actualState.includes("READY TO RESTART")) {
    console.log("🔄 Restart lottery: npm run restart-lottery");
    console.log("⚠️  No tickets sold - lottery can be restarted");
  }
  
  if (actualState.includes("CALCULATING")) {
    console.log("⏳ Wait for VRF: Winner selection in progress");
    console.log("🔗 Monitor VRF: https://vrf.chain.link/polygon");
  }
  
  if (winner.toLowerCase() === deployer.address.toLowerCase() && !prizeClaimed) {
    console.log("🎁 Claim your prize: npm run claim-prize");
    console.log(`💰 Prize amount: ${ethers.formatEther(prizePool)} POL`);
  }
  
  // Check for any claimable prizes from past rounds
  console.log("🔍 Check for unclaimed prizes: npm run claim-prize");
  
  if (isOwner) {
    try {
      const accumulatedFees = await lottery.getAccumulatedFees();
      if (accumulatedFees > 0n) {
        console.log(`💰 Withdraw fees: ${ethers.formatEther(accumulatedFees)} POL available`);
      }
    } catch (error) {
      // Ignore if we can't fetch fees
    }
  }
  
  console.log();
  console.log("🔗 Quick Links:");
  console.log(`   📱 Block Explorer: https://polygonscan.com/address/${deploymentInfo.lotteryAddress}`);
  console.log(`   🔗 VRF Subscription: https://vrf.chain.link/polygon`);
  
  console.log();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎰 Use 'npm run status' to check status anytime!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });