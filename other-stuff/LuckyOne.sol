/*
░██                       ░██                                                      
░██                       ░██                                                      
░██ ░██    ░██  ░███████  ░██    ░██░██    ░██     ░███████  ░████████   ░███████  
░██ ░██    ░██ ░██    ░██ ░██   ░██ ░██    ░██    ░██    ░██ ░██    ░██ ░██    ░██ 
░██ ░██    ░██ ░██        ░███████  ░██    ░██    ░██    ░██ ░██    ░██ ░█████████ 
░██ ░██   ░███ ░██    ░██ ░██   ░██ ░██   ░███    ░██    ░██ ░██    ░██ ░██        
░██  ░█████░██  ░███████  ░██    ░██ ░█████░██     ░███████  ░██    ░██  ░███████  
                                           ░██                                     
                                     ░███████                                                                                                          
*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DailyProgressiveLottery is VRFConsumerBaseV2, ReentrancyGuard {
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    uint256 private constant TICKET_PRICE = 1 ether; // 1 POL
    uint256 private constant LOTTERY_DURATION = 1 days; // 24 hours
    uint256 private constant MAX_TICKETS_PER_PURCHASE = 100;
    
    // Progressive fee structure based on number of players
    uint256 private constant TIER_0_FEE_PERCENTAGE = 0; // 0% for <4 players
    uint256 private constant TIER_1_FEE_PERCENTAGE = 1; // 1% for 4-10 players
    uint256 private constant TIER_2_FEE_PERCENTAGE = 2; // 2% for 11-50 players
    uint256 private constant TIER_3_FEE_PERCENTAGE = 3; // 3% for 51-100 players
    uint256 private constant TIER_4_FEE_PERCENTAGE = 4; // 4% for 101-250 players
    uint256 private constant TIER_5_FEE_PERCENTAGE = 5; // 5% for 251+ players
    
    uint256 private constant TIER_0_THRESHOLD = 3;    // <4 players
    uint256 private constant TIER_1_THRESHOLD = 10;   // 4-10 players
    uint256 private constant TIER_2_THRESHOLD = 50;   // 11-50 players
    uint256 private constant TIER_3_THRESHOLD = 100;  // 51-100 players
    uint256 private constant TIER_4_THRESHOLD = 250;  // 101-250 players
    // 251+ players = Tier 5

    address private s_owner;
    uint256 private s_currentRoundId;
    mapping(uint256 => LotteryRound) private s_lotteryRounds;
    mapping(uint256 => mapping(address => uint256)) private s_playerTickets;
    mapping(uint256 => uint256) private s_requestIdToRoundId;

    struct LotteryRound {
        uint256 roundId;
        uint256 startTime;
        uint256 endTime;
        uint256 totalTickets;
        uint256 prizePool;
        address[] players;
        address winner;
        bool ended;
        bool prizeClaimed;
        bool feeDeducted; // Track if fee was deducted when prize claimed
        uint256 requestId;
        uint256 finalFeePercentage; // Store final fee percentage for this round
    }

    enum LotteryState {
        OPEN,
        CALCULATING,
        CLOSED
    }

    event LotteryStarted(uint256 indexed roundId, uint256 startTime, uint256 endTime);
    event TicketsPurchased(address indexed player, uint256 indexed roundId, uint256 ticketCount, uint256 totalCost);
    event LotteryEnded(uint256 indexed roundId, uint256 requestId);
    event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 grossPrizeAmount, uint256 feePercentage);
    event PrizeClaimed(uint256 indexed roundId, address indexed winner, uint256 netAmount, uint256 feeDeducted);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event FeeCollected(uint256 indexed roundId, uint256 feeAmount, uint256 feePercentage);

    modifier onlyOwner() {
        require(msg.sender == s_owner, "Not the contract owner");
        _;
    }

    modifier validRound(uint256 roundId) {
        require(roundId <= s_currentRoundId, "Invalid round ID");
        _;
    }

    constructor(
        address vrfCoordinatorV2,
        uint256 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_owner = msg.sender;
        
        _startNewLottery();
    }

    function buyTickets(uint256 ticketCount) external payable nonReentrant {
        require(ticketCount > 0 && ticketCount <= MAX_TICKETS_PER_PURCHASE, "Invalid ticket count");
        require(msg.value == ticketCount * TICKET_PRICE, "Incorrect payment amount");
        
        LotteryRound storage currentRound = s_lotteryRounds[s_currentRoundId];
        require(block.timestamp < currentRound.endTime, "Lottery has ended");
        require(!currentRound.ended, "Lottery is closed");

        // Add player to the list if first time buying tickets this round
        if (s_playerTickets[s_currentRoundId][msg.sender] == 0) {
            currentRound.players.push(msg.sender);
        }

        // All payments go to prize pool initially
        // Fee will be deducted only when winner claims the prize
        s_playerTickets[s_currentRoundId][msg.sender] += ticketCount;
        currentRound.totalTickets += ticketCount;
        currentRound.prizePool += msg.value;

        emit TicketsPurchased(msg.sender, s_currentRoundId, ticketCount, msg.value);
    }

    function endLottery() external {
        LotteryRound storage currentRound = s_lotteryRounds[s_currentRoundId];
        require(block.timestamp >= currentRound.endTime, "Lottery period not over");
        require(!currentRound.ended, "Lottery already ended");
        require(currentRound.totalTickets > 0, "No tickets sold");

        currentRound.ended = true;
        
        // Calculate and store the final fee percentage based on number of players
        currentRound.finalFeePercentage = _calculateFeePercentage(currentRound.players.length);
        
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            uint64(i_subscriptionId),
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        currentRound.requestId = requestId;
        s_requestIdToRoundId[requestId] = s_currentRoundId;

        emit LotteryEnded(s_currentRoundId, requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 roundId = s_requestIdToRoundId[requestId];
        LotteryRound storage round = s_lotteryRounds[roundId];

        uint256 winningTicket = randomWords[0] % round.totalTickets;
        address winner = _getWinnerFromTicket(roundId, winningTicket);
        
        round.winner = winner;
        
        emit WinnerSelected(roundId, winner, round.prizePool, round.finalFeePercentage);
        
        _startNewLottery();
    }

    function _getWinnerFromTicket(uint256 roundId, uint256 winningTicket) private view returns (address) {
        LotteryRound storage round = s_lotteryRounds[roundId];
        uint256 ticketCount = 0;
        
        for (uint256 i = 0; i < round.players.length; i++) {
            address player = round.players[i];
            ticketCount += s_playerTickets[roundId][player];
            if (winningTicket < ticketCount) {
                return player;
            }
        }
        
        revert("Winner calculation failed");
    }

    function _startNewLottery() private {
        s_currentRoundId++;
        LotteryRound storage newRound = s_lotteryRounds[s_currentRoundId];
        newRound.roundId = s_currentRoundId;
        newRound.startTime = block.timestamp;
        newRound.endTime = block.timestamp + LOTTERY_DURATION;
        
        emit LotteryStarted(s_currentRoundId, newRound.startTime, newRound.endTime);
    }

    function _calculateFeePercentage(uint256 playerCount) private pure returns (uint256) {
        if (playerCount <= TIER_0_THRESHOLD) {
            return TIER_0_FEE_PERCENTAGE; // 0% for <4 players
        } else if (playerCount <= TIER_1_THRESHOLD) {
            return TIER_1_FEE_PERCENTAGE; // 1% for 4-10 players
        } else if (playerCount <= TIER_2_THRESHOLD) {
            return TIER_2_FEE_PERCENTAGE; // 2% for 11-50 players
        } else if (playerCount <= TIER_3_THRESHOLD) {
            return TIER_3_FEE_PERCENTAGE; // 3% for 51-100 players
        } else if (playerCount <= TIER_4_THRESHOLD) {
            return TIER_4_FEE_PERCENTAGE; // 4% for 101-250 players
        } else {
            return TIER_5_FEE_PERCENTAGE; // 5% for 251+ players
        }
    }

    function claimPrize(uint256 roundId) external nonReentrant validRound(roundId) {
        LotteryRound storage round = s_lotteryRounds[roundId];
        require(round.winner == msg.sender, "Not the winner");
        require(!round.prizeClaimed, "Prize already claimed");
        require(round.winner != address(0), "Winner not selected yet");

        round.prizeClaimed = true;
        round.feeDeducted = true;

        // Calculate fee and net prize amount
        uint256 grossPrizeAmount = round.prizePool;
        uint256 feeAmount = (grossPrizeAmount * round.finalFeePercentage) / 100;
        uint256 netPrizeAmount = grossPrizeAmount - feeAmount;

        // Transfer net prize to winner
        (bool success, ) = payable(msg.sender).call{value: netPrizeAmount}("");
        require(success, "Prize transfer failed");

        // Fee remains in contract for owner to withdraw later
        emit PrizeClaimed(roundId, msg.sender, netPrizeAmount, feeAmount);
        emit FeeCollected(roundId, feeAmount, round.finalFeePercentage);
    }

    // View functions
    function getCurrentRoundId() external view returns (uint256) {
        return s_currentRoundId;
    }

    function getLotteryRound(uint256 roundId) external view validRound(roundId) returns (
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        address,
        bool,
        bool,
        LotteryState,
        uint256
    ) {
        LotteryRound storage round = s_lotteryRounds[roundId];
        LotteryState state = _getLotteryState(roundId);
        
        return (
            round.roundId,
            round.startTime,
            round.endTime,
            round.totalTickets,
            round.prizePool,
            round.winner,
            round.ended,
            round.prizeClaimed,
            state,
            round.finalFeePercentage
        );
    }

    function _getLotteryState(uint256 roundId) private view returns (LotteryState) {
        LotteryRound storage round = s_lotteryRounds[roundId];
        
        if (round.winner != address(0)) {
            return LotteryState.CLOSED;
        }
        
        if (round.ended) {
            return LotteryState.CALCULATING;
        }
        
        return LotteryState.OPEN;
    }

    function getPlayerTickets(address player, uint256 roundId) external view validRound(roundId) returns (uint256) {
        return s_playerTickets[roundId][player];
    }

    function getPlayers(uint256 roundId) external view validRound(roundId) returns (address[] memory) {
        return s_lotteryRounds[roundId].players;
    }

    function getTicketPrice() external pure returns (uint256) {
        return TICKET_PRICE;
    }

    function getLotteryDuration() external pure returns (uint256) {
        return LOTTERY_DURATION;
    }

    function getMaxTicketsPerPurchase() external pure returns (uint256) {
        return MAX_TICKETS_PER_PURCHASE;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getCurrentFeePercentage() external view returns (uint256) {
        uint256 currentPlayerCount = s_lotteryRounds[s_currentRoundId].players.length;
        return _calculateFeePercentage(currentPlayerCount);
    }

    function getFeeStructure() external pure returns (uint256[6] memory thresholds, uint256[6] memory percentages) {
        thresholds = [TIER_0_THRESHOLD, TIER_1_THRESHOLD, TIER_2_THRESHOLD, TIER_3_THRESHOLD, TIER_4_THRESHOLD, type(uint256).max];
        percentages = [TIER_0_FEE_PERCENTAGE, TIER_1_FEE_PERCENTAGE, TIER_2_FEE_PERCENTAGE, TIER_3_FEE_PERCENTAGE, TIER_4_FEE_PERCENTAGE, TIER_5_FEE_PERCENTAGE];
    }

    function getRoundFeeDetails(uint256 roundId) external view validRound(roundId) returns (
        uint256 playerCount,
        uint256 feePercentage,
        uint256 grossPrize,
        uint256 estimatedFee,
        uint256 estimatedNetPrize
    ) {
        LotteryRound storage round = s_lotteryRounds[roundId];
        playerCount = round.players.length;
        
        if (round.ended) {
            feePercentage = round.finalFeePercentage;
        } else {
            feePercentage = _calculateFeePercentage(playerCount);
        }
        
        grossPrize = round.prizePool;
        estimatedFee = (grossPrize * feePercentage) / 100;
        estimatedNetPrize = grossPrize - estimatedFee;
    }

    // Owner functions
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        address oldOwner = s_owner;
        s_owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function getOwner() external view returns (address) {
        return s_owner;
    }

    function getAccumulatedFees() external view returns (uint256) {
        uint256 totalFees = 0;
        
        // Calculate total fees from all claimed prizes
        for (uint256 i = 1; i <= s_currentRoundId; i++) {
            LotteryRound storage round = s_lotteryRounds[i];
            if (round.feeDeducted) {
                uint256 feeAmount = (round.prizePool * round.finalFeePercentage) / 100;
                totalFees += feeAmount;
            }
        }
        
        // Subtract already withdrawn fees by calculating available balance minus unclaimed prizes
        uint256 totalUnclaimedPrizes = 0;
        for (uint256 i = 1; i <= s_currentRoundId; i++) {
            LotteryRound storage round = s_lotteryRounds[i];
            if (round.winner != address(0) && !round.prizeClaimed) {
                // For unclaimed prizes, calculate net amount (after fee deduction)
                uint256 feeAmount = (round.prizePool * round.finalFeePercentage) / 100;
                uint256 netPrizeAmount = round.prizePool - feeAmount;
                totalUnclaimedPrizes += netPrizeAmount;
            } else if (round.winner == address(0) && round.ended) {
                // Current active round - all goes to prize pool
                totalUnclaimedPrizes += round.prizePool;
            }
        }
        
        uint256 availableFees = address(this).balance - totalUnclaimedPrizes;
        return availableFees;
    }

    function withdrawFees() external onlyOwner {
        uint256 availableFees = getAccumulatedFees();
        require(availableFees > 0, "No fees to withdraw");
        
        (bool success, ) = payable(s_owner).call{value: availableFees}("");
        require(success, "Fee withdrawal failed");
    }

    function emergencyWithdraw() external onlyOwner {
        require(address(this).balance > 0, "No funds to withdraw");
        
        uint256 balance = address(this).balance;
        (bool success, ) = payable(s_owner).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    receive() external payable {
        revert("Direct payments not allowed");
    }

    fallback() external payable {
        revert("Function not found");
    }
}