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

import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LuckyOne is VRFConsumerBaseV2Plus, ReentrancyGuard {
    IVRFCoordinatorV2Plus private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    uint256 private constant TICKET_PRICE = 10 ether;
    uint256 private constant LOTTERY_DURATION = 24 hours;
    uint256 private constant MAX_TICKETS_PER_PURCHASE = 100;
    
    // Tiered fee structure
    uint256 private constant FREE_TIER_LIMIT = 100;
    uint256 private constant MID_TIER_LIMIT = 1000;
    uint256 private constant MID_TIER_FEE_PERCENTAGE = 250; // 2.5% (250 basis points)
    uint256 private constant HIGH_TIER_FEE_PERCENTAGE = 500; // 5% (500 basis points)
    uint256 private constant BASIS_POINTS = 10000; // For percentage calculations

    address private s_owner;
    uint256 private s_currentRoundId;
    uint256 private s_accumulatedFees; // Accumulated owner fees
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
        uint256 requestId;
    }

    enum LotteryState {
        OPEN,
        CALCULATING,
        CLOSED
    }

    event LotteryStarted(uint256 indexed roundId, uint256 startTime, uint256 endTime);
    event TicketsPurchased(address indexed player, uint256 indexed roundId, uint256 ticketCount, uint256 totalCost);
    event LotteryEnded(uint256 indexed roundId, uint256 requestId);
    event LotteryRestarted(uint256 indexed oldRoundId, uint256 indexed newRoundId);
    event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 prizeAmount);
    event PrizeClaimed(uint256 indexed roundId, address indexed winner, uint256 amount);
    event FeeWithdrawn(address indexed owner, uint256 amount);
    event FeeCollected(uint256 indexed roundId, uint256 feeAmount);

    modifier onlyContractOwner() {
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
    ) VRFConsumerBaseV2Plus(vrfCoordinatorV2) {
        i_vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinatorV2);
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

        if (s_playerTickets[s_currentRoundId][msg.sender] == 0) {
            currentRound.players.push(msg.sender);
        }

        // Calculate tiered owner fee
        uint256 ownerFee = _calculateTieredFee(currentRound.totalTickets, ticketCount);
        uint256 prizeAmount = msg.value - ownerFee;
        
        s_playerTickets[s_currentRoundId][msg.sender] += ticketCount;
        currentRound.totalTickets += ticketCount;
        currentRound.prizePool += prizeAmount;
        s_accumulatedFees += ownerFee;

        emit TicketsPurchased(msg.sender, s_currentRoundId, ticketCount, msg.value);
        emit FeeCollected(s_currentRoundId, ownerFee);
    }

    function endLottery() external {
        LotteryRound storage currentRound = s_lotteryRounds[s_currentRoundId];
        require(block.timestamp >= currentRound.endTime, "Lottery period not over");
        require(!currentRound.ended, "Lottery already ended");
        require(currentRound.totalTickets > 0, "No tickets sold");

        currentRound.ended = true;
        
        VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient.RandomWordsRequest({
            keyHash: i_gasLane,
            subId: i_subscriptionId,
            requestConfirmations: REQUEST_CONFIRMATIONS,
            callbackGasLimit: i_callbackGasLimit,
            numWords: NUM_WORDS,
            extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
        });
        
        uint256 requestId = i_vrfCoordinator.requestRandomWords(request);

        currentRound.requestId = requestId;
        s_requestIdToRoundId[requestId] = s_currentRoundId;

        emit LotteryEnded(s_currentRoundId, requestId);
    }

    function restartLottery() external {
        LotteryRound storage currentRound = s_lotteryRounds[s_currentRoundId];
        require(block.timestamp >= currentRound.endTime, "Lottery period not over");
        require(!currentRound.ended, "Lottery already ended");
        require(currentRound.totalTickets == 0, "Cannot restart lottery with participants");

        // Mark current round as ended without selecting a winner
        currentRound.ended = true;
        
        uint256 oldRoundId = s_currentRoundId;
        
        // Start a new lottery round
        _startNewLottery();
        
        emit LotteryRestarted(oldRoundId, s_currentRoundId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 roundId = s_requestIdToRoundId[requestId];
        LotteryRound storage round = s_lotteryRounds[roundId];

        uint256 winningTicket = randomWords[0] % round.totalTickets;
        address winner = _getWinnerFromTicket(roundId, winningTicket);
        
        round.winner = winner;
        
        emit WinnerSelected(roundId, winner, round.prizePool);
        
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

    function _calculateTieredFee(uint256 currentTotalTickets, uint256 newTicketCount) private pure returns (uint256) {
        uint256 totalFee = 0;
        uint256 processedTickets = 0;
        uint256 remainingTickets = newTicketCount;
        
        // Process tickets in tiers based on current total
        for (uint256 i = 0; i < newTicketCount && remainingTickets > 0; i++) {
            uint256 ticketPosition = currentTotalTickets + i + 1;
            uint256 ticketCost = TICKET_PRICE;
            uint256 feeForThisTicket = 0;
            
            if (ticketPosition <= FREE_TIER_LIMIT) {
                // First 100 tickets: 0% fee
                feeForThisTicket = 0;
            } else if (ticketPosition <= MID_TIER_LIMIT) {
                // Tickets 101-1000: 2.5% fee
                feeForThisTicket = (ticketCost * MID_TIER_FEE_PERCENTAGE) / BASIS_POINTS;
            } else {
                // Tickets 1001+: 5% fee
                feeForThisTicket = (ticketCost * HIGH_TIER_FEE_PERCENTAGE) / BASIS_POINTS;
            }
            
            totalFee += feeForThisTicket;
            processedTickets++;
            remainingTickets--;
        }
        
        return totalFee;
    }

    function _startNewLottery() private {
        s_currentRoundId++;
        LotteryRound storage newRound = s_lotteryRounds[s_currentRoundId];
        newRound.roundId = s_currentRoundId;
        newRound.startTime = block.timestamp;
        newRound.endTime = block.timestamp + LOTTERY_DURATION;
        
        emit LotteryStarted(s_currentRoundId, newRound.startTime, newRound.endTime);
    }

    function claimPrize(uint256 roundId) external nonReentrant validRound(roundId) {
        LotteryRound storage round = s_lotteryRounds[roundId];
        require(round.winner == msg.sender, "Not the winner");
        require(!round.prizeClaimed, "Prize already claimed");
        require(round.winner != address(0), "Winner not selected yet");

        round.prizeClaimed = true;
        uint256 prizeAmount = round.prizePool;

        (bool success, ) = payable(msg.sender).call{value: prizeAmount}("");
        require(success, "Prize transfer failed");

        emit PrizeClaimed(roundId, msg.sender, prizeAmount);
    }

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
        LotteryState
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
            state
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

    function getFeeStructure() external pure returns (uint256, uint256, uint256, uint256) {
        return (FREE_TIER_LIMIT, MID_TIER_LIMIT, MID_TIER_FEE_PERCENTAGE, HIGH_TIER_FEE_PERCENTAGE);
    }

    function calculateFeeForTickets(uint256 currentTotalTickets, uint256 ticketCount) external pure returns (uint256) {
        return _calculateTieredFee(currentTotalTickets, ticketCount);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getOwner() external view returns (address) {
        return s_owner;
    }

    function withdrawFees() external onlyContractOwner {
        require(s_accumulatedFees > 0, "No fees to withdraw");
        
        uint256 feeAmount = s_accumulatedFees;
        s_accumulatedFees = 0;
        
        (bool success, ) = payable(s_owner).call{value: feeAmount}("");
        require(success, "Fee withdrawal failed");
        
        emit FeeWithdrawn(s_owner, feeAmount);
    }
    
    function getAccumulatedFees() external view returns (uint256) {
        return s_accumulatedFees;
    }


    receive() external payable {
        revert("Direct payments not allowed");
    }

    fallback() external payable {
        revert("Function not found");
    }
}