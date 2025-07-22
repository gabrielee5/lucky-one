const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const [player] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  // Get parameters from command line arguments
  const args = process.argv.slice(2);
  const address = args.find(arg => arg.startsWith('--address='))?.split('=')[1] || player.address;
  const roundsToCheck = parseInt(args.find(arg => arg.startsWith('--rounds='))?.split('=')[1]) || 5;
  
  console.log("👤 === PLAYER INFORMATION ===");
  console.log(`📍 Network: ${networkName}`);
  console.log(`🔍 Player: ${address}`);
  console.log(`📊 Checking last ${roundsToCheck} rounds`);
  console.log();

  // Validate address
  if (!ethers.isAddress(address)) {
    console.error("❌ Invalid address format");
    return;
  }

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
  const playerBalance = await player.provider.getBalance(address);
  
  console.log("📊 PLAYER OVERVIEW");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`💰 Wallet Balance: ${ethers.formatEther(playerBalance)} MATIC`);
  console.log(`🎯 Current Round: ${currentRoundId.toString()}`);
  console.log(`📋 Contract: ${deploymentInfo.lotteryAddress}`);
  
  // Check if this is the player's own address
  if (address.toLowerCase() === player.address.toLowerCase()) {
    console.log(`👤 Viewing: Your own information`);
  } else {
    console.log(`👤 Viewing: ${address}`);
  }
  
  console.log();
  
  // Collect player statistics
  let totalTicketsBought = 0;
  let totalAmountSpent = 0n;
  let totalWinnings = 0n;
  let roundsParticipated = 0;
  let roundsWon = 0;
  let unclaimedPrizes = [];
  
  const ticketPrice = await lottery.getTicketPrice();
  
  console.log("🎟️  ROUND-BY-ROUND ANALYSIS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Check rounds from currentRoundId down to max(1, currentRoundId - roundsToCheck + 1)
  const startRound = Number(currentRoundId) - roundsToCheck + 1;
  const endRound = Number(currentRoundId);
  
  for (let roundId = Math.max(1, startRound); roundId <= endRound; roundId++) {
    try {
      const playerTickets = await lottery.getPlayerTickets(address, roundId);
      
      // Skip rounds where player didn't participate
      if (playerTickets === 0n) {
        console.log(`Round ${roundId}: No participation`);
        continue;
      }
      
      roundsParticipated++;
      totalTicketsBought += Number(playerTickets);
      totalAmountSpent += playerTickets * ticketPrice;
      
      // Get round info
      const [, startTime, endTime, totalTickets, prizePool, winner, ended, prizeClaimed, state] = 
        await lottery.getLotteryRound(roundId);
      
      const isWinner = winner.toLowerCase() === address.toLowerCase();
      const winChance = totalTickets > 0n ? (Number(playerTickets) / Number(totalTickets)) * 100 : 0;
      
      // Status indicators
      let statusIcon = "🟢";
      let statusText = "OPEN";
      if (state === 1n) {
        statusIcon = "🟡";
        statusText = "CALCULATING";
      } else if (state === 2n) {
        statusIcon = "🔴";
        statusText = "CLOSED";
      }
      
      console.log(`Round ${roundId}: ${playerTickets} tickets (${winChance.toFixed(1)}% chance) ${statusIcon} ${statusText}`);
      console.log(`   Period: ${new Date(Number(startTime) * 1000).toLocaleDateString()} - ${new Date(Number(endTime) * 1000).toLocaleDateString()}`);
      console.log(`   Spent: ${ethers.formatEther(playerTickets * ticketPrice)} MATIC`);
      
      if (winner !== ethers.ZeroAddress) {
        if (isWinner) {
          console.log(`   Result: 🏆 WON! Prize: ${ethers.formatEther(prizePool)} MATIC`);
          roundsWon++;
          totalWinnings += prizePool;
          
          if (!prizeClaimed) {
            console.log(`   Status: ⚠️  PRIZE UNCLAIMED!`);
            unclaimedPrizes.push({
              round: roundId,
              amount: prizePool,
              amountFormatted: ethers.formatEther(prizePool)
            });
          } else {
            console.log(`   Status: ✅ Prize claimed`);
          }
        } else {
          console.log(`   Result: ❌ Lost (Winner: ${winner.substring(0, 10)}...)`);
        }
      } else if (ended) {
        console.log(`   Result: ⏳ Pending winner selection`);
      } else {
        console.log(`   Result: ⏳ Round in progress`);
      }
      
      console.log();
      
    } catch (error) {
      console.log(`Round ${roundId}: Error fetching data - ${error.message}`);
    }
  }
  
  // Summary statistics
  console.log("📈 PLAYER STATISTICS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🎟️  Total Tickets Bought: ${totalTicketsBought}`);
  console.log(`💸 Total Amount Spent: ${ethers.formatEther(totalAmountSpent)} MATIC`);
  console.log(`🎯 Rounds Participated: ${roundsParticipated}`);
  console.log(`🏆 Rounds Won: ${roundsWon}`);
  
  if (roundsParticipated > 0) {
    const winRate = (roundsWon / roundsParticipated) * 100;
    console.log(`📊 Win Rate: ${winRate.toFixed(1)}%`);
  }
  
  if (totalWinnings > 0n) {
    console.log(`💰 Total Winnings: ${ethers.formatEther(totalWinnings)} MATIC`);
    
    const netResult = totalWinnings - totalAmountSpent;
    if (netResult > 0n) {
      console.log(`📈 Net Result: +${ethers.formatEther(netResult)} MATIC (Profit)`);
    } else if (netResult < 0n) {
      console.log(`📉 Net Result: ${ethers.formatEther(netResult)} MATIC (Loss)`);
    } else {
      console.log(`📊 Net Result: Break Even`);
    }
  } else {
    console.log(`📉 Net Result: -${ethers.formatEther(totalAmountSpent)} MATIC (All spent)`);
  }
  
  // Unclaimed prizes alert
  if (unclaimedPrizes.length > 0) {
    console.log();
    console.log("🚨 UNCLAIMED PRIZES!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    let totalUnclaimed = 0n;
    unclaimedPrizes.forEach(prize => {
      console.log(`🏆 Round ${prize.round}: ${prize.amountFormatted} MATIC`);
      totalUnclaimed += prize.amount;
    });
    
    console.log(`💰 Total Unclaimed: ${ethers.formatEther(totalUnclaimed)} MATIC`);
    console.log();
    console.log("💡 To claim prizes:");
    unclaimedPrizes.forEach(prize => {
      console.log(`   npm run claim-prize:${networkName} -- --round=${prize.round}`);
    });
  }
  
  // Current round participation
  const currentRoundTickets = await lottery.getPlayerTickets(address, currentRoundId);
  if (currentRoundTickets > 0n) {
    console.log();
    console.log("🎯 CURRENT ROUND PARTICIPATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const [, , currentEndTime, currentTotalTickets, currentPrizePool, , , , currentState] = 
      await lottery.getLotteryRound(currentRoundId);
    
    const currentWinChance = currentTotalTickets > 0n 
      ? (Number(currentRoundTickets) / Number(currentTotalTickets)) * 100 
      : 0;
    
    console.log(`🎟️  Your Tickets: ${currentRoundTickets}`);
    console.log(`🎯 Win Chance: ${currentWinChance.toFixed(2)}%`);
    console.log(`💰 Potential Prize: ${ethers.formatEther(currentPrizePool)} MATIC`);
    
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = Number(currentEndTime) - now;
    
    if (timeRemaining > 0) {
      const days = Math.floor(timeRemaining / (24 * 60 * 60));
      const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
      console.log(`⏰ Time Remaining: ${days}d ${hours}h`);
    } else {
      console.log(`⏰ Status: Ready to end!`);
    }
  }
  
  console.log();
  console.log("💡 AVAILABLE ACTIONS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`• Buy tickets: npm run buy-tickets:${networkName} -- --tickets=5`);
  console.log(`• Check status: npm run status:${networkName}`);
  
  if (unclaimedPrizes.length > 0) {
    console.log(`• Claim prizes: npm run claim-prize:${networkName} -- --round=N`);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log("👤 Player Information");
  console.log();
  console.log("Description:");
  console.log("  Shows detailed information about a player's lottery participation,");
  console.log("  including tickets bought, winnings, losses, and unclaimed prizes.");
  console.log();
  console.log("Usage:");
  console.log("  npm run player-info:amoy");
  console.log("  npm run player-info:amoy -- --address=0x123... --rounds=10");
  console.log();
  console.log("Options:");
  console.log("  --address=ADDR Address to check (default: your address)");
  console.log("  --rounds=N     Number of recent rounds to check (default: 5)");
  console.log("  --help, -h     Show this help message");
  console.log();
  console.log("Information Shown:");
  console.log("  • Wallet balance and current round participation");
  console.log("  • Round-by-round ticket purchases and results");
  console.log("  • Win/loss statistics and net profit/loss");
  console.log("  • Unclaimed prizes (if any)");
  console.log("  • Current round participation details");
  console.log();
  console.log("Examples:");
  console.log("  npm run player-info:amoy                              # Your info");
  console.log("  npm run player-info:amoy -- --rounds=10              # Check 10 rounds");
  console.log("  npm run player-info:amoy -- --address=0x123...       # Check other player");
  console.log("  npm run player-info:amoy -- --address=0x123... --rounds=20  # Detailed check");
  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });