import React, { useState, useEffect } from 'react';
import { Coins, RefreshCw, ExternalLink } from 'lucide-react';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import WalletConnection from './components/WalletConnection';
import LotteryStatus from './components/LotteryStatus';
import TicketPurchase from './components/TicketPurchase';
import WinnerDisplay from './components/WinnerDisplay';
import { CONTRACT_CONFIG } from './utils/contractABI';

// Set contract address here after deployment
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual deployed address

function App() {
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [lotteryData, setLotteryData] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(null);
  const [maxTickets, setMaxTickets] = useState(null);
  const [userTickets, setUserTickets] = useState(0);
  const [pastWinners, setPastWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const wallet = useWallet();
  const contract = useContract(wallet.signer, CONTRACT_ADDRESS);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load lottery data when wallet connects or contract changes
  useEffect(() => {
    if (contract.contract) {
      loadLotteryData();
      const interval = setInterval(loadLotteryData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [contract.contract, wallet.account]);

  const loadLotteryData = async () => {
    if (!contract.contract) return;

    try {
      setError(null);
      setLoading(true);

      // Load basic lottery info
      const [currentRoundId, ticketPriceResult, maxTicketsResult] = await Promise.all([
        contract.getCurrentRoundId(),
        contract.getTicketPrice(),
        contract.getMaxTicketsPerPurchase()
      ]);

      setTicketPrice(ticketPriceResult);
      setMaxTickets(Number(maxTicketsResult));

      // Load current round data
      const roundData = await contract.getLotteryRound(currentRoundId);
      const [
        roundId,
        startTime,
        endTime,
        totalTickets,
        prizePool,
        winner,
        ended,
        prizeClaimed,
        state
      ] = roundData;

      setLotteryData({
        roundId,
        startTime,
        endTime,
        totalTickets,
        prizePool,
        winner,
        ended,
        prizeClaimed,
        state
      });

      // Load user tickets if wallet is connected
      if (wallet.account) {
        const userTicketCount = await contract.getPlayerTickets(wallet.account, currentRoundId);
        setUserTickets(Number(userTicketCount));
      }

      // Load past winners
      await loadPastWinners();

    } catch (error) {
      console.error('Error loading lottery data:', error);
      setError('Failed to load lottery data');
    } finally {
      setLoading(false);
    }
  };

  const loadPastWinners = async () => {
    if (!contract.contract) return;

    try {
      // Get winner selected events
      const winnerLogs = await contract.getEventLogs('WinnerSelected');
      
      const winners = await Promise.all(
        winnerLogs.slice(-10).map(async (log) => {
          const { roundId, winner, prizeAmount } = log.args;
          
          // Get round data to check if prize was claimed
          const roundData = await contract.getLotteryRound(roundId);
          const [, , , totalTickets, prizePool, , , prizeClaimed] = roundData;
          
          return {
            roundId,
            winner,
            prizePool: prizeAmount,
            totalTickets,
            prizeClaimed
          };
        })
      );

      setPastWinners(winners.reverse());
    } catch (error) {
      console.error('Error loading past winners:', error);
    }
  };

  const handleBuyTickets = async (ticketCount) => {
    if (!wallet.isConnected || !contract.contract) {
      throw new Error('Wallet not connected');
    }

    if (!wallet.isCorrectNetwork) {
      throw new Error('Please switch to the correct network');
    }

    try {
      await contract.buyTickets(ticketCount, ticketPrice);
      // Refresh data after successful purchase
      setTimeout(loadLotteryData, 2000);
      await wallet.refreshBalance();
    } catch (error) {
      console.error('Error buying tickets:', error);
      throw error;
    }
  };

  const handleClaimPrize = async (roundId) => {
    if (!wallet.isConnected || !contract.contract) {
      throw new Error('Wallet not connected');
    }

    try {
      await contract.claimPrize(roundId);
      // Refresh data after successful claim
      setTimeout(loadLotteryData, 2000);
      await wallet.refreshBalance();
    } catch (error) {
      console.error('Error claiming prize:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLotteryData();
    if (wallet.account) {
      await wallet.refreshBalance();
    }
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Decentralized Lottery</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Provably fair lottery powered by Chainlink VRF
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {CONTRACT_ADDRESS && (
              <a
                href={`${CONTRACT_CONFIG.NETWORKS[CONTRACT_CONFIG.NETWORK_NAME]?.blockExplorer}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Contract
              </a>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Connection */}
          <div className="lg:col-span-1">
            <WalletConnection
              wallet={wallet}
              onConnect={wallet.connect}
              onDisconnect={wallet.disconnect}
              onSwitchNetwork={wallet.switchToCorrectNetwork}
              className="mb-6"
            />
          </div>

          {/* Lottery Status */}
          <div className="lg:col-span-2">
            <LotteryStatus
              lotteryData={lotteryData}
              ticketPrice={ticketPrice}
              loading={loading}
              error={error}
              currentTime={currentTime}
            />
          </div>

          {/* Ticket Purchase */}
          <div className="lg:col-span-1">
            <TicketPurchase
              ticketPrice={ticketPrice}
              maxTickets={maxTickets}
              currentRoundId={lotteryData?.roundId}
              totalTickets={Number(lotteryData?.totalTickets) || 0}
              userTickets={userTickets}
              onBuyTickets={handleBuyTickets}
              loading={contract.loading}
              error={contract.error}
              isWalletConnected={wallet.isConnected}
              isCorrectNetwork={wallet.isCorrectNetwork}
              lotteryState={lotteryData?.state || 0}
            />
          </div>

          {/* Winner Display */}
          <div className="lg:col-span-2">
            <WinnerDisplay
              pastWinners={pastWinners}
              userAddress={wallet.account}
              onClaimPrize={handleClaimPrize}
              loading={contract.loading}
              error={contract.error}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400">
          <div className="border-t border-gray-700 pt-8">
            <p className="mb-2">
              Built with React, Ethers.js, and Chainlink VRF
            </p>
            <p className="text-sm">
              This is a decentralized application. Always verify contract addresses and understand the risks.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;