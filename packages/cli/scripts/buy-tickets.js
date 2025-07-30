const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const [buyer] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  // Get parameters from environment variables or command line arguments
  // Hardhat passes extra args after the script name, so we look for them there
  const args = process.argv.slice(2);
  const ticketCount = process.env.TICKETS || args.find(arg => arg.startsWith('tickets='))?.split('=')[1] || '1';
  const roundId = process.env.ROUND || args.find(arg => arg.startsWith('round='))?.split('=')[1];
  
  console.log("🎟️  === BUY LOTTERY TICKETS ===");
  console.log(`📍 Network: ${networkName}`);
  console.log(`👤 Buyer: ${buyer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await buyer.provider.getBalance(buyer.address))} MATIC`);
  console.log(`🎫 Tickets to buy: ${ticketCount}`);
  console.log();

  // Validate ticket count
  const tickets = parseInt(ticketCount);
  if (isNaN(tickets) || tickets < 1 || tickets > 100) {
    console.error("❌ Invalid ticket count. Must be between 1 and 100.");
    return;
  }

  // Load deployment info
  const deploymentFile = `deployments/${networkName}.json`;
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ No deployment found for ${networkName}. Please deploy first.`);
    return;
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const lottery = await ethers.getContractAt("DecentralizedLottery", deploymentInfo.lotteryAddress);
  
  // Get current lottery info
  const currentRoundId = await lottery.getCurrentRoundId();
  const targetRound = roundId ? BigInt(roundId) : currentRoundId;
  
  console.log(`🎯 Target Round: ${targetRound.toString()}`);
  
  // Check if round exists and is valid
  if (targetRound > currentRoundId) {
    console.error(`❌ Round ${targetRound} doesn't exist yet. Current round: ${currentRoundId}`);
    return;
  }
  
  // Get round info
  const [, startTime, endTime, totalTickets, prizePool, winner, ended, , state] = 
    await lottery.getLotteryRound(targetRound);
  
  if (targetRound < currentRoundId) {
    console.log(`ℹ️  Note: Buying tickets for past round ${targetRound}`);
  }
  
  // Check if lottery is open
  if (state !== 0n) {
    console.error(`❌ Lottery round ${targetRound} is not open for ticket purchases.`);
    console.log(`   Current state: ${state === 1n ? 'CALCULATING' : 'CLOSED'}`);
    return;
  }
  
  if (ended) {
    console.error(`❌ Lottery round ${targetRound} has already ended.`);
    return;
  }
  
  // Check time remaining
  const now = Math.floor(Date.now() / 1000);
  const timeRemaining = Number(endTime) - now;
  
  if (timeRemaining <= 0) {
    console.error(`❌ Lottery round ${targetRound} time has expired.`);
    console.log(`   Ended: ${new Date(Number(endTime) * 1000).toLocaleString()}`);
    return;
  }
  
  // Calculate cost
  const ticketPrice = await lottery.getTicketPrice();
  const totalCost = ticketPrice * BigInt(tickets);
  
  console.log("📊 LOTTERY STATUS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🕒 Ends: ${new Date(Number(endTime) * 1000).toLocaleString()}`);
  console.log(`⏳ Time Remaining: ${Math.floor(timeRemaining / 3600)}h ${Math.floor((timeRemaining % 3600) / 60)}m`);
  console.log(`🎟️  Current Tickets: ${totalTickets.toString()}`);
  console.log(`💰 Prize Pool: ${ethers.formatEther(prizePool)} MATIC`);
  console.log();
  
  console.log("💸 PURCHASE DETAILS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🎫 Ticket Price: ${ethers.formatEther(ticketPrice)} MATIC`);
  console.log(`🛒 Buying: ${tickets} tickets`);
  console.log(`💰 Total Cost: ${ethers.formatEther(totalCost)} MATIC`);
  console.log(`💰 Prize Contribution (95%): ${ethers.formatEther(totalCost * 95n / 100n)} MATIC`);
  console.log(`🏛️  Owner Fee (5%): ${ethers.formatEther(totalCost * 5n / 100n)} MATIC`);
  console.log();
  
  // Check balance
  const balance = await buyer.provider.getBalance(buyer.address);
  if (balance < totalCost) {
    console.error(`❌ Insufficient balance. Need: ${ethers.formatEther(totalCost)} MATIC`);
    console.log(`   Your balance: ${ethers.formatEther(balance)} MATIC`);
    return;
  }
  
  // Check existing tickets
  const existingTickets = await lottery.getPlayerTickets(buyer.address, targetRound);
  if (existingTickets > 0) {
    console.log(`ℹ️  You already have ${existingTickets} tickets in this round`);
  }
  
  try {
    console.log("🚀 Submitting transaction...");
    const tx = await lottery.buyTickets(tickets, { value: totalCost });
    
    console.log(`📄 Transaction hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    console.log();
    console.log("✅ PURCHASE SUCCESSFUL!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🎫 Tickets Purchased: ${tickets}`);
    console.log(`💰 Amount Paid: ${ethers.formatEther(totalCost)} MATIC`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`🔗 Transaction: ${receipt.hash}`);
    
    // Get updated info
    const newTickets = await lottery.getPlayerTickets(buyer.address, targetRound);
    const updatedLottery = await lottery.getLotteryRound(targetRound);
    
    console.log();
    console.log("📊 UPDATED STATUS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🎟️  Your Total Tickets: ${newTickets.toString()}`);
    console.log(`🎟️  Round Total Tickets: ${updatedLottery[3].toString()}`);
    console.log(`💰 Updated Prize Pool: ${ethers.formatEther(updatedLottery[4])} MATIC`);
    
    if (updatedLottery[3] > 0n) {
      const winChance = (Number(newTickets) / Number(updatedLottery[3])) * 100;
      console.log(`🎯 Your Win Chance: ${winChance.toFixed(2)}%`);
    }
    
    const newBalance = await buyer.provider.getBalance(buyer.address);
    console.log(`💰 Remaining Balance: ${ethers.formatEther(newBalance)} MATIC`);
    
  } catch (error) {
    console.error("❌ TRANSACTION FAILED!");
    console.error("Error:", error.message);
    
    if (error.message.includes("Incorrect payment amount")) {
      console.log("💡 Tip: Make sure you're paying exactly the right amount");
    } else if (error.message.includes("Lottery has ended")) {
      console.log("💡 Tip: This lottery round has ended, try the current round");
    } else if (error.message.includes("Invalid ticket count")) {
      console.log("💡 Tip: Ticket count must be between 1 and 100");
    }
  }
}

// Show usage if help requested
if (process.argv.includes('--usage') || process.argv.includes('--info')) {
  console.log("🎟️  Buy Lottery Tickets");
  console.log();
  console.log("Usage:");
  console.log("  TICKETS=5 npm run buy-tickets:amoy");
  console.log("  TICKETS=10 ROUND=2 npm run buy-tickets:amoy");
  console.log();
  console.log("Environment Variables:");
  console.log("  TICKETS=N      Number of tickets to buy (1-100, default: 1)");
  console.log("  ROUND=N        Specific round ID (default: current round)");
  console.log();
  console.log("Examples:");
  console.log("  npm run buy-tickets:amoy                   # Buy 1 ticket (default)");
  console.log("  TICKETS=5 npm run buy-tickets:amoy         # Buy 5 tickets");
  console.log("  TICKETS=25 npm run buy-tickets:amoy        # Buy 25 tickets");
  console.log("  TICKETS=5 ROUND=1 npm run buy-tickets:amoy # Buy 5 tickets for round 1");
  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });