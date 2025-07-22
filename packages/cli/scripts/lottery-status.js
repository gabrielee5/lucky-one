const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  console.log("🎰 ===== LOTTERY STATUS DASHBOARD =====");
  console.log(`📍 Network: ${networkName}`);
  console.log(`👤 Your Address: ${deployer.address}`);
  console.log(`💰 Your Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} MATIC`);
  console.log();

  // Load deployment info
  const fs = require('fs');
  const deploymentFile = `deployments/${networkName}.json`;
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ No deployment found for ${networkName}. Please deploy first.`);
    return;
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const lottery = await ethers.getContractAt("DecentralizedLottery", deploymentInfo.lotteryAddress);
  
  console.log("📋 CONTRACT INFORMATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🏠 Contract Address: ${deploymentInfo.lotteryAddress}`);
  console.log(`👑 Owner: ${await lottery.getOwner()}`);
  console.log(`💎 Contract Balance: ${ethers.formatEther(await lottery.getContractBalance())} MATIC`);
  console.log(`🎟️  Ticket Price: ${ethers.formatEther(await lottery.getTicketPrice())} MATIC`);
  
  // Check if user is owner
  const isOwner = (await lottery.getOwner()).toLowerCase() === deployer.address.toLowerCase();
  if (isOwner) {
    console.log("👑 You are the owner of this lottery!");
    try {
      const accumulatedFees = await lottery.getAccumulatedFees();
      console.log(`💰 Accumulated Fees: ${ethers.formatEther(accumulatedFees)} MATIC`);
    } catch (error) {
      console.log("⚠️  Could not fetch accumulated fees");
    }
  }
  
  console.log();
  
  // Current lottery round info
  const currentRoundId = await lottery.getCurrentRoundId();
  const [roundId, startTime, endTime, totalTickets, prizePool, winner, ended, prizeClaimed, state] = 
    await lottery.getLotteryRound(currentRoundId);
  
  console.log("🎯 CURRENT LOTTERY ROUND");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔢 Round ID: ${roundId.toString()}`);
  
  const now = Math.floor(Date.now() / 1000);
  const startTimeNum = Number(startTime);
  const endTimeNum = Number(endTime);
  
  console.log(`🚀 Started: ${new Date(startTimeNum * 1000).toLocaleString()}`);
  console.log(`⏰ Ends: ${new Date(endTimeNum * 1000).toLocaleString()}`);
  
  // Calculate time remaining
  const timeRemaining = endTimeNum - now;
  if (timeRemaining > 0) {
    const days = Math.floor(timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
    console.log(`⏳ Time Remaining: ${days}d ${hours}h ${minutes}m`);
  } else {
    console.log("⏳ Time Remaining: EXPIRED (can be ended)");
  }
  
  console.log(`🎟️  Total Tickets Sold: ${totalTickets.toString()}`);
  console.log(`💰 Prize Pool: ${ethers.formatEther(prizePool)} MATIC`);
  
  // Lottery state
  const stateNames = ["🟢 OPEN", "🟡 CALCULATING", "🔴 CLOSED"];
  console.log(`📊 Status: ${stateNames[Number(state)]}`);
  
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
  const yourTickets = await lottery.getPlayerTickets(deployer.address, currentRoundId);
  console.log(`🎟️  Your Tickets: ${yourTickets.toString()}`);
  
  if (yourTickets > 0) {
    const yourInvestment = yourTickets * await lottery.getTicketPrice();
    console.log(`💸 Your Investment: ${ethers.formatEther(yourInvestment)} MATIC`);
    
    if (totalTickets > 0) {
      const winChance = (Number(yourTickets) / Number(totalTickets)) * 100;
      console.log(`🎯 Win Chance: ${winChance.toFixed(2)}%`);
    }
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
  
  // Action suggestions
  console.log("💡 AVAILABLE ACTIONS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  if (state === 0n) { // OPEN
    console.log("🛒 Buy tickets: npm run test:amoy");
    console.log("🎟️  Max tickets per purchase: 100");
  }
  
  if (timeRemaining <= 0 && !ended && totalTickets > 0) {
    console.log("🎲 End lottery: Call endLottery() function");
  }
  
  if (isOwner && await lottery.getAccumulatedFees() > 0) {
    console.log("💰 Withdraw fees: Call withdrawFees() function");
  }
  
  if (winner === deployer.address && !prizeClaimed) {
    console.log("🎁 Claim prize: Call claimPrize() function");
  }
  
  console.log();
  console.log("🔗 Quick Links:");
  console.log(`   📱 Block Explorer: https://amoy.polygonscan.com/address/${deploymentInfo.lotteryAddress}`);
  console.log(`   🔗 VRF Subscription: https://vrf.chain.link/polygon-amoy`);
  
  console.log();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎰 Use 'npm run status:amoy' to check status anytime!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });