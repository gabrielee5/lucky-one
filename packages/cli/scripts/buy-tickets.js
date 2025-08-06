const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const [buyer] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  // Get parameters from environment variables or command line arguments
  // Hardhat passes extra args after the script name, so we look for them there
  const args = process.argv.slice(2);
  const ticketCount = process.env.TICKETS || args.find(arg => arg.startsWith('tickets='))?.split('=')[1] || args[0] || '1';
  
  console.log("🎟️  === BUY LOTTERY TICKETS ===");
  console.log(`📍 Network: ${networkName}`);
  console.log(`👤 Buyer: ${buyer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await buyer.provider.getBalance(buyer.address))} POL`);
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
  const lottery = await ethers.getContractAt("LuckyOne", deploymentInfo.lotteryAddress);
  
  // Get current lottery info - always use current round
  const currentRoundId = await lottery.getCurrentRoundId();
  const targetRound = currentRoundId;
  
  console.log(`🎯 Current Round: ${targetRound.toString()}`);
  
  // Get round info
  const [, startTime, endTime, totalTickets, prizePool, winner, ended, , state] = 
    await lottery.getLotteryRound(targetRound);
  
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
  
  // Calculate cost and fees based on tiered structure
  const ticketPrice = await lottery.getTicketPrice();
  const totalCost = ticketPrice * BigInt(tickets);
  const ownerFee = await lottery.calculateFeeForTickets(totalTickets, tickets);
  const prizeContribution = totalCost - ownerFee;
  
  console.log("📊 LOTTERY STATUS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🕒 Ends: ${new Date(Number(endTime) * 1000).toLocaleString()}`);
  console.log(`⏳ Time Remaining: ${Math.floor(timeRemaining / 3600)}h ${Math.floor((timeRemaining % 3600) / 60)}m`);
  console.log(`🎟️  Current Tickets: ${totalTickets.toString()}`);
  console.log(`💰 Prize Pool: ${ethers.formatEther(prizePool)} POL`);
  console.log();
  
  console.log("💸 PURCHASE DETAILS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🎫 Ticket Price: ${ethers.formatEther(ticketPrice)} POL`);
  console.log(`🛒 Buying: ${tickets} tickets`);
  console.log(`💰 Total Cost: ${ethers.formatEther(totalCost)} POL`);
  console.log(`💰 Prize Contribution: ${ethers.formatEther(prizeContribution)} POL`);
  console.log(`🏛️  Owner Fee (Tiered): ${ethers.formatEther(ownerFee)} POL`);
  
  // Show fee breakdown based on ticket position
  const currentTotal = Number(totalTickets);
  let feeBreakdown = "";
  if (currentTotal < 100) {
    const freeTickets = Math.min(tickets, 100 - currentTotal);
    const midTierTickets = Math.min(Math.max(tickets - freeTickets, 0), Math.min(900, Math.max(0, currentTotal + tickets - 100)));
    const highTierTickets = Math.max(0, tickets - freeTickets - midTierTickets);
    
    if (freeTickets > 0) feeBreakdown += `${freeTickets} tickets @ 0% fee, `;
    if (midTierTickets > 0) feeBreakdown += `${midTierTickets} tickets @ 2.5% fee, `;
    if (highTierTickets > 0) feeBreakdown += `${highTierTickets} tickets @ 5% fee, `;
    
    if (feeBreakdown) {
      console.log(`📊 Fee Breakdown: ${feeBreakdown.slice(0, -2)}`);
    }
  } else if (currentTotal < 1000) {
    const midTierTickets = Math.min(tickets, 1000 - currentTotal);
    const highTierTickets = Math.max(0, tickets - midTierTickets);
    
    if (midTierTickets > 0) feeBreakdown += `${midTierTickets} tickets @ 2.5% fee, `;
    if (highTierTickets > 0) feeBreakdown += `${highTierTickets} tickets @ 5% fee, `;
    
    if (feeBreakdown) {
      console.log(`📊 Fee Breakdown: ${feeBreakdown.slice(0, -2)}`);
    }
  } else {
    console.log(`📊 Fee Breakdown: ${tickets} tickets @ 5% fee`);
  }
  console.log();
  
  // Check balance
  const balance = await buyer.provider.getBalance(buyer.address);
  if (balance < totalCost) {
    console.error(`❌ Insufficient balance. Need: ${ethers.formatEther(totalCost)} POL`);
    console.log(`   Your balance: ${ethers.formatEther(balance)} POL`);
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
    console.log(`💰 Amount Paid: ${ethers.formatEther(totalCost)} POL`);
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
    console.log(`💰 Updated Prize Pool: ${ethers.formatEther(updatedLottery[4])} POL`);
    
    if (updatedLottery[3] > 0n) {
      const winChance = (Number(newTickets) / Number(updatedLottery[3])) * 100;
      console.log(`🎯 Your Win Chance: ${winChance.toFixed(2)}%`);
    }
    
    const newBalance = await buyer.provider.getBalance(buyer.address);
    console.log(`💰 Remaining Balance: ${ethers.formatEther(newBalance)} POL`);
    
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
  console.log("  npm run buy-tickets [tickets]");
  console.log("  TICKETS=5 npm run buy-tickets");
  console.log();
  console.log("Parameters:");
  console.log("  tickets        Number of tickets to buy (1-100, default: 1)");
  console.log();
  console.log("Environment Variables:");
  console.log("  TICKETS=N      Number of tickets to buy (1-100, default: 1)");
  console.log();
  console.log("Examples:");
  console.log("  npm run buy-tickets                   # Buy 1 ticket (default)");
  console.log("  TICKETS=5 npm run buy-tickets         # Buy 5 tickets");
  console.log();
  console.log("Note: Always buys tickets for the current active round");
  console.log("Fee Structure: First 100 tickets (0%), Next 900 tickets (2.5%), Remaining tickets (5%)");
  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });