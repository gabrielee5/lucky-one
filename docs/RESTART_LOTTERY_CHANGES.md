# Restart Lottery Feature Implementation

## Overview
Modified the LuckyOne.sol contract and frontend to add a restart functionality when a lottery round ends without any participants.

## Smart Contract Changes

### File: `packages/contracts/contracts/LuckyOne.sol`

#### New Event Added:
```solidity
event LotteryRestarted(uint256 indexed oldRoundId, uint256 indexed newRoundId);
```

#### New Function Added:
```solidity
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
```

#### Function Requirements:
- Lottery period must be over (`block.timestamp >= currentRound.endTime`)
- Current round must not be already ended
- No tickets must have been sold (`currentRound.totalTickets == 0`)

## Frontend Changes

### File: `packages/app/src/constants/index.js`

#### Added ABI entries:
1. **LotteryRestarted Event**:
```javascript
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "oldRoundId",
      "type": "uint256"
    },
    {
      "indexed": true,
      "internalType": "uint256", 
      "name": "newRoundId",
      "type": "uint256"
    }
  ],
  "name": "LotteryRestarted",
  "type": "event"
}
```

2. **restartLottery Function**:
```javascript
{
  "inputs": [],
  "name": "restartLottery", 
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}
```

### File: `packages/app/src/hooks/useLottery.js`

#### Added new hook:
```javascript
export const useRestartLottery = () => {
  const contract = useContract()
  const queryClient = useQueryClient()

  return useMutation(
    async () => {
      if (!contract) throw new Error('Contract not available')

      const tx = await contract.restartLottery()
      const loadingToast = toast.loading('Restarting lottery...')
      
      try {
        await tx.wait()
        toast.dismiss(loadingToast)
        toast.success('Lottery restarted! New round has begun.')
        
        queryClient.invalidateQueries(['lotteryData'])
        
        return tx
      } catch (error) {
        toast.dismiss(loadingToast)
        throw error
      }
    },
    {
      onError: (error) => {
        toast.error(error.message || 'Failed to restart lottery')
      }
    }
  )
}
```

### File: `packages/app/src/components/LotteryStatus.jsx`

#### Added RestartLotteryButton component:
```javascript
const RestartLotteryButton = () => {
  const { mutate: restartLottery, isLoading: isRestartingLottery } = useRestartLottery()
  const { isConnected } = useWalletStore()

  const handleRestartLottery = () => {
    restartLottery()
  }

  if (!isConnected) return null

  return (
    <PurpleButton
      onClick={handleRestartLottery}
      disabled={isRestartingLottery}
      className="bg-blue-600 hover:bg-blue-700 border-blue-500"
    >
      {isRestartingLottery ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Restarting Lottery...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Restart Lottery
        </>
      )}
    </PurpleButton>
  )
}
```

#### Updated UI Logic:
- When lottery expires with participants: Shows "End Lottery" button
- When lottery expires without participants: Shows "Restart Lottery" button
- Updated status messages accordingly

## Usage Flow

1. **Lottery Round Ends**: When a lottery round reaches its end time
2. **Check Participants**: System checks if any tickets were sold
3. **With Participants**: Shows "End Lottery" button → Calls `endLottery()` → Selects winner via VRF
4. **No Participants**: Shows "Restart Lottery" button → Calls `restartLottery()` → Starts new round immediately

## Benefits

- **Prevents stuck rounds**: No more rounds that can't progress due to no participants
- **Improved UX**: Clear action available for users when rounds have no participants
- **Gas efficient**: Avoids VRF calls when unnecessary
- **Automatic progression**: Keeps the lottery system moving forward

## Testing

- App compiles successfully with all changes
- Available on `http://localhost:3006/` after running `npm run dev`
- Ready for contract deployment and testing

## Next Steps

1. Deploy the updated contract to testnet
2. Update the contract address in frontend config
3. Test the restart functionality in the live environment
4. Update any deployment scripts if needed