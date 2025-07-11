// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

contract VRFCoordinatorV2Mock is VRFCoordinatorV2Interface {
    uint256 private requestId = 1;
    mapping(uint256 => address) private requests;
    
    constructor(uint256 baseFee, uint256 gasPriceLink) {}
    
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 requestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external override returns (uint256) {
        uint256 currentRequestId = requestId++;
        requests[currentRequestId] = msg.sender;
        return currentRequestId;
    }
    
    function createSubscription() external returns (uint64) {
        return 1;
    }
    
    function getSubscription(uint64 subId) external view returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    ) {
        return (100 ether, 0, address(this), new address[](0));
    }
    
    function requestSubscriptionOwnerTransfer(uint64 subId, address newOwner) external {}
    
    function acceptSubscriptionOwnerTransfer(uint64 subId) external {}
    
    function addConsumer(uint64 subId, address consumer) external {}
    
    function removeConsumer(uint64 subId, address consumer) external {}
    
    function cancelSubscription(uint64 subId, address to) external {}
    
    function pendingRequestExists(uint64 subId) external view returns (bool) {
        return false;
    }
    
    function fundSubscription(uint64 subId, uint96 amount) external {}
    
    function getRequestConfig() external view returns (uint16, uint32, bytes32[] memory) {
        bytes32[] memory keyHashes = new bytes32[](1);
        keyHashes[0] = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
        return (3, 500000, keyHashes);
    }
    
    function fulfillRandomWords(uint256 _requestId, address _consumer) external {
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = uint256(keccak256(abi.encode(block.timestamp, _requestId))) % 1000000;
        
        // Call the consumer contract's fulfillRandomWords function
        (bool success, ) = _consumer.call(
            abi.encodeWithSignature("rawFulfillRandomWords(uint256,uint256[])", _requestId, randomWords)
        );
        require(success, "Failed to fulfill random words");
    }
}