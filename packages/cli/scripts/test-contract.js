const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = hre.network.name;
  
  console.log("=== Testing Contract on", networkName, "===");
  console.log("Tester address:", deployer.address);
  console.log("Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "MATIC");

  // Load deployment info
  const fs = require('fs');
  const deploymentFile = `deployments/${networkName}.json`;
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`No deployment found for ${networkName}. Please deploy first.`);
    return;
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log("Contract address:", deploymentInfo.lotteryAddress);
  
  // Connect to deployed contract
  const lottery = await ethers.getContractAt("LuckyOne", deploymentInfo.lotteryAddress);
  
  // Test 1: Check basic contract info
  console.log("\n=== Test 1: Basic Contract Info ===");
  const owner = await lottery.getOwner();
  const currentRoundId = await lottery.getCurrentRoundId();
  const ticketPrice = await lottery.getTicketPrice();
  const contractBalance = await lottery.getContractBalance();
  
  console.log("Owner:", owner);
  console.log("Current Round ID:", currentRoundId.toString());
  console.log("Ticket Price:", ethers.formatEther(ticketPrice), "MATIC");
  console.log("Contract Balance:", ethers.formatEther(contractBalance), "MATIC");
  
  // Test 2: Get current lottery round info
  console.log("\n=== Test 2: Current Lottery Round ===");
  const [roundId, startTime, endTime, totalTickets, prizePool, winner, ended, prizeClaimed, state] = 
    await lottery.getLotteryRound(currentRoundId);
  
  console.log("Round ID:", roundId.toString());
  console.log("Start Time:", new Date(Number(startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(endTime) * 1000).toLocaleString());
  console.log("Total Tickets:", totalTickets.toString());
  console.log("Prize Pool:", ethers.formatEther(prizePool), "MATIC");
  console.log("Winner:", winner);
  console.log("Ended:", ended);
  console.log("State:", state === 0n ? "OPEN" : state === 1n ? "CALCULATING" : "CLOSED");
  
  // Test 3: Buy tickets
  console.log("\n=== Test 3: Buying Tickets ===");
  const ticketCount = 3;
  const totalCost = ticketPrice * BigInt(ticketCount);
  
  console.log(`Buying ${ticketCount} tickets for ${ethers.formatEther(totalCost)} MATIC`);
  
  try {
    const tx = await lottery.buyTickets(ticketCount, { value: totalCost });
    const receipt = await tx.wait();
    console.log("Transaction hash:", receipt.hash);
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Check updated lottery info
    const updatedLotteryInfo = await lottery.getLotteryRound(currentRoundId);
    console.log("Updated total tickets:", updatedLotteryInfo[3].toString());
    console.log("Updated prize pool:", ethers.formatEther(updatedLotteryInfo[4]), "MATIC");
    
    // Check player tickets
    const playerTickets = await lottery.getPlayerTickets(deployer.address, currentRoundId);
    console.log("Player tickets:", playerTickets.toString());
    
  } catch (error) {
    console.error("Error buying tickets:", error.message);
  }
  
  // Test 4: Check owner fees (if owner)
  if (owner.toLowerCase() === deployer.address.toLowerCase()) {
    console.log("\n=== Test 4: Owner Fee System ===");
    try {
      const accumulatedFees = await lottery.getAccumulatedFees();
      console.log("Accumulated fees:", ethers.formatEther(accumulatedFees), "MATIC");
      
      if (accumulatedFees > 0) {
        console.log("Withdrawing fees...");
        const withdrawTx = await lottery.withdrawFees();
        await withdrawTx.wait();
        console.log("Fees withdrawn successfully!");
        
        const remainingFees = await lottery.getAccumulatedFees();
        console.log("Remaining fees:", ethers.formatEther(remainingFees), "MATIC");
      }
    } catch (error) {
      console.error("Error checking/withdrawing fees:", error.message);
    }
  }
  
  // Test 5: Check contract events
  console.log("\n=== Test 5: Recent Events ===");
  try {
    const filter = lottery.filters.TicketsPurchased();
    const events = await lottery.queryFilter(filter, -100); // Last 100 blocks
    console.log(`Found ${events.length} TicketsPurchased events`);
    
    events.slice(-3).forEach((event, index) => {
      console.log(`Event ${index + 1}:`, {
        player: event.args.player,
        roundId: event.args.roundId.toString(),
        ticketCount: event.args.ticketCount.toString(),
        totalCost: ethers.formatEther(event.args.totalCost)
      });
    });
  } catch (error) {
    console.error("Error querying events:", error.message);
  }
  
  console.log("\n=== Testing Complete ===");
  console.log("Final balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "MATIC");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });