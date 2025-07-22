const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔧 Updating frontend configuration...");
  
  // Read the compiled contract ABI
  const artifactPath = path.join(__dirname, '../../contracts/artifacts/contracts/DecentralizedLottery.sol/DecentralizedLottery.json');
  const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Load deployment info for Amoy
  const deploymentPath = path.join(__dirname, '../deployments/polygonAmoy.json');
  let deploymentInfo = {};
  
  if (fs.existsSync(deploymentPath)) {
    deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("✅ Found Amoy deployment info");
  } else {
    console.log("⚠️  No Amoy deployment found");
  }
  
  // Create the updated frontend configuration
  const frontendConfig = `export const LOTTERY_ABI = ${JSON.stringify(contractArtifact.abi, null, 2)};

export const LOTTERY_STATE = {
  OPEN: 0,
  CALCULATING: 1,
  CLOSED: 2
};

export const CONTRACT_CONFIG = {
  // Default to Polygon Amoy for development
  CHAIN_ID: 80002,
  NETWORK_NAME: "polygonAmoy",
  RPC_URL: "https://rpc-amoy.polygon.technology/",
  CONTRACT_ADDRESS: "${deploymentInfo.lotteryAddress || ''}", // Amoy testnet address
  
  // Network configurations
  NETWORKS: {
    localhost: {
      chainId: 31337,
      name: "localhost",
      rpcUrl: "http://127.0.0.1:8545",
      blockExplorer: "",
      currency: "ETH"
    },
    sepolia: {
      chainId: 11155111,
      name: "sepolia",
      rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY",
      blockExplorer: "https://sepolia.etherscan.io",
      currency: "ETH"
    },
    polygonAmoy: {
      chainId: 80002,
      name: "Polygon Amoy",
      rpcUrl: "https://rpc-amoy.polygon.technology/",
      blockExplorer: "https://amoy.polygonscan.com",
      currency: "MATIC",
      contractAddress: "${deploymentInfo.lotteryAddress || ''}"
    },
    polygonMumbai: {
      chainId: 80001,
      name: "Polygon Mumbai",
      rpcUrl: "https://rpc-mumbai.maticvigil.com/",
      blockExplorer: "https://mumbai.polygonscan.com",
      currency: "MATIC",
      deprecated: true
    },
    polygon: {
      chainId: 137,
      name: "Polygon",
      rpcUrl: "https://polygon-rpc.com/",
      blockExplorer: "https://polygonscan.com",
      currency: "MATIC"
    }
  }
};

// Helper function to get network by chain ID
export function getNetworkByChainId(chainId) {
  return Object.values(CONTRACT_CONFIG.NETWORKS).find(network => network.chainId === chainId);
}

// Helper function to format currency
export function formatCurrency(amount, network = 'polygonAmoy') {
  const config = CONTRACT_CONFIG.NETWORKS[network];
  return \`\${amount} \${config?.currency || 'ETH'}\`;
}

// Contract constants
export const LOTTERY_CONSTANTS = {
  TICKET_PRICE: "0.01", // MATIC
  LOTTERY_DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
  MAX_TICKETS_PER_PURCHASE: 100,
  OWNER_FEE_PERCENTAGE: 5, // 5%
  PRIZE_POOL_PERCENTAGE: 95 // 95%
};
`;

  // Write the updated configuration
  const configPath = path.join(__dirname, '../../app/src/utils/contractABI.js');
  fs.writeFileSync(configPath, frontendConfig);
  
  console.log("✅ Updated frontend/src/utils/contractABI.js");
  console.log(`📋 Contract Address: ${deploymentInfo.lotteryAddress || 'Not deployed'}`);
  console.log(`🌐 Network: Polygon Amoy (Chain ID: 80002)`);
  console.log(`💰 Currency: MATIC`);
  console.log(`🔗 Block Explorer: https://amoy.polygonscan.com`);
  
  // Check if we need to update other files
  console.log("\n🔍 Checking other frontend files...");
  
  // Check useContract hook
  const useContractPath = path.join(__dirname, '../../app/src/hooks/useContract.js');
  if (fs.existsSync(useContractPath)) {
    console.log("📁 Found useContract.js - may need manual review");
  }
  
  // Check if we have a wallet connection component
  const walletPath = path.join(__dirname, '../../app/src/hooks/useWallet.js');
  if (fs.existsSync(walletPath)) {
    console.log("📁 Found useWallet.js - may need Polygon network support");
  }
  
  console.log("\n🎯 Next steps:");
  console.log("1. Review frontend components for fee system integration");
  console.log("2. Test wallet connection with Polygon Amoy");
  console.log("3. Update MetaMask network configuration");
  console.log("4. Run 'npm run frontend' to test the updated configuration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });