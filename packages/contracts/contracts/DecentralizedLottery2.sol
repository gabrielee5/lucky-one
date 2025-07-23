// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DecentralizedLottery is VRFConsumerBaseV2, ReentrancyGuard {
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    uint256 private constant TICKET_PRICE = 0.01 ether;
    uint256 private constant LOTTERY_DURATION = 7 days;
    uint256 private constant MAX_TICKETS_PER_PURCHASE = 100;
    uint256 private constant OWNER_FEE_PERCENTAGE = 5; // 5% fee for owner

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
    event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 prizeAmount);
    event PrizeClaimed(uint256 indexed roundId, address indexed winner, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event FeeWithdrawn(address indexed owner, uint256 amount);
    event FeeCollected(uint256 indexed roundId, uint256 feeAmount);

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

        if (s_playerTickets[s_currentRoundId][msg.sender] == 0) {
            currentRound.players.push(msg.sender);
        }

        // Calculate owner fee (5% of ticket purchase)
        uint256 ownerFee = (msg.value * OWNER_FEE_PERCENTAGE) / 100;
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
        
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId, // VRF v2.5 uses uint256 for subscription ID
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

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        address oldOwner = s_owner;
        s_owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function getOwner() external view returns (address) {
        return s_owner;
    }

    function withdrawFees() external onlyOwner {
        require(s_accumulatedFees > 0, "No fees to withdraw");
        
        uint256 feeAmount = s_accumulatedFees;
        s_accumulatedFees = 0;
        
        (bool success, ) = payable(s_owner).call{value: feeAmount}("");
        require(success, "Fee withdrawal failed");
        
        emit FeeWithdrawn(s_owner, feeAmount);
    }
    
    function getAccumulatedFees() external view onlyOwner returns (uint256) {
        return s_accumulatedFees;
    }

    function emergencyWithdraw() external onlyOwner {
        require(address(this).balance > 0, "No funds to withdraw");
        
        uint256 balance = address(this).balance;
        s_accumulatedFees = 0; // Reset fees in emergency
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