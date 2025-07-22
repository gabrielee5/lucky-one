const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log("Contract verified successfully!");
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified!");
    } else {
      console.log("Verification failed:", e.message);
    }
  }
}

module.exports = { verify };