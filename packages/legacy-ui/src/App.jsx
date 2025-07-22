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
const CONTRACT_ADDRESS = "0xaE3214F7b7ba132FEE0227F0a6828018Db8d83E9"; // Replace with actual deployed address

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
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Coins className="w-14 h-14 text-yellow-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Decentralized Lottery
            </h1>
          </div>
          <p className="text-gray-300 text-xl font-medium mb-2">
            Provably fair lottery powered by Chainlink VRF
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full mx-auto mb-8"></div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {CONTRACT_ADDRESS && (
              <a
                href={`${CONTRACT_CONFIG.NETWORKS[CONTRACT_CONFIG.NETWORK_NAME]?.blockExplorer}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
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
        <footer className="mt-16 text-center text-gray-400">
          <div className="border-t border-slate-600/50 pt-8">
            <p className="mb-3 text-lg font-medium">
              Built with React, Ethers.js, and Chainlink VRF
            </p>
            <p className="text-base font-medium">
              This is a decentralized application. Always verify contract addresses and understand the risks.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;