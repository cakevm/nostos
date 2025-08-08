# Nostos Smart Contracts

This directory contains the Solidity smart contracts for the Nostos lost and found platform, built with Foundry.

## Deployed Contracts

- **Sepolia**: `0x59c836DF385deF565213fA55883289381373a268`
- **Base Sepolia**: `0xBC3E1381b9f3Ef13E937481DCF9d6ed802dF2BB2`
- **Mainnet**: Not yet deployed

## Contract Overview

### Nostos.sol
The main contract that handles:
- Item registration with encrypted data storage
- Claim submission and approval system  
- Reward distribution to finders
- Direct fee transfer to EOA (0.00125 ETH = $5 at $4000/ETH)
- Security features: pausable, reentrancy guards, access control

## Setup

### Install Dependencies
```bash
# Install Foundry dependencies
./install-deps.sh

# Or manually:
forge install foundry-rs/forge-std --no-git
forge install OpenZeppelin/openzeppelin-contracts --no-git
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
```env
PRIVATE_KEY=0x...      # Deployer private key
FEE_RECIPIENT=0x...    # Address to receive registration fees
RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
```

## Development

### Build
```bash
forge build
```

### Test
```bash
# Run all tests
forge test

# Run with verbose output
forge test -vvv

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test testRegisterItem
```

### Coverage
```bash
forge coverage
```

### Format
```bash
forge fmt
```

## Deployment

### Deploy to Sepolia
```bash
source .env
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Deploy to Base Sepolia
```bash
source .env
forge script script/Deploy.s.sol \
  --rpc-url https://base-sepolia.infura.io/v3/YOUR_API_KEY \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Deploy to Mainnet
```bash
source .env
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL_MAINNET \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

## Contract Functions

### For Item Owners
- `registerItem(bytes32 itemId, uint256 rewardAmount, bytes encryptedDetails)` - Register a lost item
- `updateReward(bytes32 itemId, uint256 newReward)` - Update reward amount
- `pauseItem(bytes32 itemId)` / `unpauseItem(bytes32 itemId)` - Pause/unpause an item
- `approveClaim(bytes32 itemId, uint256 claimIndex)` - Approve a claim and pay reward
- `rejectClaim(bytes32 itemId, uint256 claimIndex)` - Reject a claim

### For Finders
- `submitClaim(bytes32 itemId, bytes encryptedContactInfo)` - Submit a claim for a found item

### View Functions
- `getItem(bytes32 itemId)` - Get item details
- `getItemClaims(bytes32 itemId)` - Get all claims for an item
- `getUserItems(address user)` - Get all items registered by a user
- `getRegistrationFee()` - Get current registration fee (0.00125 ETH)

## Security Considerations

1. **Encryption**: All sensitive data is encrypted off-chain before storage
2. **Access Control**: Only item owners can approve/reject claims
3. **Reentrancy Protection**: All external calls use reentrancy guards
4. **Pausable**: Contract can be paused in emergencies
5. **Direct Transfer**: Fees go directly to EOA, no withdrawal pattern needed

## Gas Optimization

The contract uses several gas optimization techniques:
- Packed structs for efficient storage
- Events for off-chain data indexing
- Minimal on-chain storage of encrypted data
- Direct ETH transfers instead of withdrawal pattern

## Testing

The test suite includes 22 comprehensive tests covering:
- Item registration and validation
- Claim submission and approval
- Fee handling and transfers
- Security features (pausable, access control)
- Edge cases and error conditions

All tests pass with 100% coverage of critical functions.

## License

MIT