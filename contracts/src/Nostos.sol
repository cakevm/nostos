// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Nostos - Decentralized Lost & Found Platform with Private Rewards
 * @notice Pay-on-claim system with encrypted rewards and comprehensive event logging
 * @dev All item data is encrypted client-side, rewards are paid only when items are found
 */
contract Nostos is ReentrancyGuard, Pausable {
    // Constants
    address public immutable feeRecipient;
    uint256 public immutable deploymentChainId;
    uint256 public constant PLATFORM_FEE = 0.0001 ether; // Platform fee (goes to feeRecipient)
    uint256 public constant MIN_STAKE = 0.0004 ether; // Minimum stake (stays in contract for forfeiture)
    uint256 public constant REGISTRATION_FEE = 0.0005 ether; // Total minimum payment (fee + stake)
    uint256 public constant CLAIM_TIMEOUT = 30 days; // Time to respond to claims
    
    enum ItemStatus { Active, HasClaims, Returned, Abandoned }
    enum ClaimStatus { Pending, ContactRevealed, Completed, Disputed }
    
    struct Item {
        address owner;              // 20 bytes
        ItemStatus status;          // 1 byte  
        uint64 registrationTime;    // 8 bytes - no overflow issues
        uint64 lastActivity;        // 8 bytes - for timeouts
        uint256 stake;              // Registration stake
        bytes encryptedData;        // All item details including private reward
    }
    
    struct Claim {
        address finder;             // 20 bytes
        ClaimStatus status;         // 1 byte
        uint64 timestamp;           // 8 bytes - no overflow issues
        uint64 revealDeadline;      // 8 bytes - no overflow issues
        uint256 escrowAmount;       // Deposited reward amount
        bytes encryptedContact;     // Finder's contact info
    }
    
    // Storage
    mapping(bytes32 => Item) public items;
    mapping(bytes32 => Claim[]) public claims;
    mapping(address => bytes32[]) public userItems; // Track items per user
    mapping(address => bytes32[]) public finderClaims; // Track items claimed by finder
    mapping(address => uint256) public userStats;   // Pack user statistics
    
    // Comprehensive Events for dApp scanning
    event ItemRegistered(
        bytes32 indexed itemId,
        address indexed owner,
        uint256 stake,
        uint256 timestamp,
        bytes encryptedData
    );
    
    event ClaimSubmitted(
        bytes32 indexed itemId,
        address indexed finder,
        uint256 indexed claimIndex,
        uint256 timestamp,
        bytes encryptedContact
    );
    
    event ContactRevealed(
        bytes32 indexed itemId,
        address indexed owner,
        uint256 indexed claimIndex,
        uint256 escrowAmount,
        uint256 timestamp
    );
    
    event ItemReturned(
        bytes32 indexed itemId,
        address indexed owner,
        address indexed finder,
        uint256 rewardAmount,
        uint256 timestamp
    );
    
    event ItemAbandoned(
        bytes32 indexed itemId,
        address indexed owner,
        uint256 timestamp
    );
    
    event ClaimDisputed(
        bytes32 indexed itemId,
        uint256 indexed claimIndex,
        address indexed disputer,
        uint256 timestamp
    );
    
    event StakeForfeited(
        bytes32 indexed itemId,
        address indexed finder,
        uint256 amount,
        uint256 timestamp
    );
    
    event UserStatsUpdated(
        address indexed user,
        uint256 totalItems,
        uint256 activeItems,
        uint256 returnedItems
    );
    
    // Errors
    error InsufficientFee();
    error ItemNotFound();
    error NotItemOwner();
    error NotFinder();
    error ItemAlreadyExists();
    error EmptyData();
    error InvalidStatus();
    error InsufficientEscrow();
    error ClaimExpired();
    error NoActiveClaim();
    
    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
        deploymentChainId = block.chainid;
    }
    
    /**
     * @notice Get the registration fee
     */
    function getRegistrationFee() public pure returns (uint256) {
        return REGISTRATION_FEE;
    }
    
    /**
     * @notice Register a lost item with private reward (pay-on-claim model)
     * @param itemId Unique identifier for the item
     * @param encryptedData Encrypted item details including private reward amount
     */
    function registerItem(
        bytes32 itemId,
        bytes calldata encryptedData
    ) external payable nonReentrant whenNotPaused {
        if (msg.value < REGISTRATION_FEE) revert InsufficientFee();
        if (items[itemId].owner != address(0)) revert ItemAlreadyExists();
        if (encryptedData.length == 0) revert EmptyData();
        
        uint64 currentTime = uint64(block.timestamp);
        
        // Calculate stake amount (everything except the platform fee)
        uint256 stakeAmount = msg.value - PLATFORM_FEE;
        
        items[itemId] = Item({
            owner: msg.sender,
            status: ItemStatus.Active,
            registrationTime: currentTime,
            lastActivity: currentTime,
            stake: stakeAmount,  // Store stake amount (will be kept in contract)
            encryptedData: encryptedData
        });
        
        // Track user items
        userItems[msg.sender].push(itemId);
        _updateUserStats(msg.sender, 1, 1, 0);  // Increment both total and active
        
        // Transfer platform fee to feeRecipient, keep stake in contract
        if (PLATFORM_FEE > 0) {
            (bool success, ) = feeRecipient.call{value: PLATFORM_FEE}("");
            require(success, "Fee transfer failed");
        }
        
        emit ItemRegistered(itemId, msg.sender, stakeAmount, block.timestamp, encryptedData);
    }
    
    /**
     * @notice Submit a claim for a found item (free - can be sponsored)
     * @param itemId The ID of the found item
     * @param encryptedContact Encrypted contact information
     */
    function submitClaim(
        bytes32 itemId,
        bytes calldata encryptedContact
    ) external nonReentrant whenNotPaused {
        Item storage item = items[itemId];
        if (item.owner == address(0)) revert ItemNotFound();
        if (item.status == ItemStatus.Returned) revert InvalidStatus();
        if (encryptedContact.length == 0) revert EmptyData();
        
        uint64 currentTime = uint64(block.timestamp);
        
        claims[itemId].push(Claim({
            finder: msg.sender,
            status: ClaimStatus.Pending,
            timestamp: currentTime,
            revealDeadline: currentTime + uint64(CLAIM_TIMEOUT),
            escrowAmount: 0,
            encryptedContact: encryptedContact
        }));
        
        // Track this claim for the finder
        finderClaims[msg.sender].push(itemId);
        
        // Update item status
        if (item.status == ItemStatus.Active) {
            item.status = ItemStatus.HasClaims;
        }
        item.lastActivity = currentTime;
        
        uint256 claimIndex = claims[itemId].length - 1;
        emit ClaimSubmitted(itemId, msg.sender, claimIndex, block.timestamp, encryptedContact);
    }
    
    /**
     * @notice Owner deposits reward to reveal finder's contact info
     * @param itemId The ID of the item
     * @param claimIndex Which claim to reveal
     */
    function revealContactInfo(
        bytes32 itemId,
        uint256 claimIndex
    ) external payable nonReentrant whenNotPaused {
        Item storage item = items[itemId];
        if (item.owner != msg.sender) revert NotItemOwner();
        if (claimIndex >= claims[itemId].length) revert ItemNotFound();
        
        Claim storage claim = claims[itemId][claimIndex];
        if (claim.status != ClaimStatus.Pending) revert InvalidStatus();
        if (block.timestamp > claim.revealDeadline) revert ClaimExpired();
        if (msg.value == 0) revert InsufficientEscrow();
        
        // Update claim status and escrow amount
        claim.status = ClaimStatus.ContactRevealed;
        claim.escrowAmount = msg.value;
        item.lastActivity = uint64(block.timestamp);
        
        emit ContactRevealed(itemId, msg.sender, claimIndex, msg.value, block.timestamp);
    }
    
    /**
     * @notice Confirm item return and release reward to finder
     * @param itemId The ID of the returned item
     * @param claimIndex Which claim to complete
     */
    function confirmReturn(
        bytes32 itemId,
        uint256 claimIndex
    ) external nonReentrant whenNotPaused {
        Item storage item = items[itemId];
        if (item.owner == address(0)) revert ItemNotFound();
        if (item.owner != msg.sender) revert NotItemOwner();
        if (claimIndex >= claims[itemId].length) revert ItemNotFound();
        
        Claim storage claim = claims[itemId][claimIndex];
        if (claim.status != ClaimStatus.ContactRevealed) revert InvalidStatus();
        if (claim.escrowAmount == 0) revert InsufficientEscrow();
        
        // Update statuses
        claim.status = ClaimStatus.Completed;
        item.status = ItemStatus.Returned;
        item.lastActivity = uint64(block.timestamp);
        
        // Release reward to finder
        uint256 rewardAmount = claim.escrowAmount;
        claim.escrowAmount = 0; // Prevent reentrancy
        
        (bool success, ) = claim.finder.call{value: rewardAmount}("");
        require(success, "Reward transfer failed");
        
        emit ItemReturned(itemId, msg.sender, claim.finder, rewardAmount, block.timestamp);
        _updateUserStats(msg.sender, 0, -1, 1);
    }
    
    /**
     * @notice Finder can claim stake if owner doesn't respond to claim in time
     * @param itemId The ID of the item
     * @param claimIndex Which claim to forfeit
     */
    function claimStakeForfeiture(
        bytes32 itemId,
        uint256 claimIndex
    ) external nonReentrant {
        Item storage item = items[itemId];
        if (item.owner == address(0)) revert ItemNotFound();
        if (claimIndex >= claims[itemId].length) revert ItemNotFound();
        
        Claim storage claim = claims[itemId][claimIndex];
        if (claim.finder != msg.sender) revert NotFinder();
        if (claim.status != ClaimStatus.Pending) revert InvalidStatus();
        if (block.timestamp <= claim.revealDeadline) revert ClaimExpired();
        
        // Forfeit owner's stake to finder
        uint256 stakeAmount = item.stake;
        item.stake = 0;
        item.status = ItemStatus.Abandoned;
        
        (bool success, ) = claim.finder.call{value: stakeAmount}("");
        require(success, "Stake transfer failed");
        
        emit StakeForfeited(itemId, claim.finder, stakeAmount, block.timestamp);
        emit ItemAbandoned(itemId, item.owner, block.timestamp);
    }
    
    // View Functions
    
    /**
     * @notice Get comprehensive item details
     * @param itemId The ID of the item
     */
    function getItem(bytes32 itemId) external view returns (
        address owner,
        ItemStatus status,
        uint64 registrationTime,
        uint64 lastActivity,
        uint256 stake,
        bytes memory encryptedData
    ) {
        Item memory item = items[itemId];
        return (
            item.owner,
            item.status,
            item.registrationTime,
            item.lastActivity,
            item.stake,
            item.encryptedData
        );
    }
    
    /**
     * @notice Get a specific claim for an item
     * @param itemId The ID of the item
     * @param index The claim index
     */
    function getClaim(bytes32 itemId, uint256 index) external view returns (
        address finder,
        ClaimStatus status,
        uint64 timestamp,
        uint64 revealDeadline,
        uint256 escrowAmount,
        bytes memory encryptedContact
    ) {
        require(index < claims[itemId].length, "Invalid claim index");
        Claim memory claim = claims[itemId][index];
        return (
            claim.finder,
            claim.status,
            claim.timestamp,
            claim.revealDeadline,
            claim.escrowAmount,
            claim.encryptedContact
        );
    }
    
    /**
     * @notice Get all items for a user (alternative to event scanning)
     * @param user The user's address
     * @return itemIds Array of item IDs owned by the user
     */
    function getUserItems(address user) external view returns (bytes32[] memory) {
        return userItems[user];
    }
    
    /**
     * @notice Get all items a finder has claimed (alternative to event scanning)
     * @param finder The finder's address
     * @return itemIds Array of item IDs the finder has claimed
     */
    function getFinderClaims(address finder) external view returns (bytes32[] memory) {
        return finderClaims[finder];
    }
    
    /**
     * @notice Get the claim index for a specific finder on an item
     * @param itemId The ID of the item
     * @param finder The finder's address
     * @return claimIndex The index of the finder's claim, or type(uint256).max if not found
     */
    function getFinderClaimIndex(bytes32 itemId, address finder) external view returns (uint256) {
        Claim[] memory itemClaims = claims[itemId];
        for (uint256 i = 0; i < itemClaims.length; i++) {
            if (itemClaims[i].finder == finder) {
                return i;
            }
        }
        return type(uint256).max; // Not found
    }
    
    /**
     * @notice Get the number of claims for an item
     * @param itemId The ID of the item
     */
    function getClaimCount(bytes32 itemId) external view returns (uint256) {
        return claims[itemId].length;
    }
    
    /**
     * @notice Get user statistics
     * @param user The user's address
     * @return stats Packed statistics (total, active, returned items)
     */
    function getUserStats(address user) external view returns (uint256) {
        return userStats[user];
    }
    
    // Internal Functions
    
    /**
     * @notice Update user statistics and emit event
     * @param user The user's address
     * @param totalDelta Change in total items
     * @param activeDelta Change in active items
     * @param returnedDelta Change in returned items
     */
    function _updateUserStats(
        address user,
        int256 totalDelta,
        int256 activeDelta,
        int256 returnedDelta
    ) internal {
        uint256 stats = userStats[user];
        
        // Unpack current stats
        uint256 totalItems = stats & 0xFFFF;
        uint256 activeItems = (stats >> 16) & 0xFFFF;
        uint256 returnedItems = (stats >> 32) & 0xFFFF;
        
        // Apply deltas
        if (totalDelta != 0) {
            totalItems = uint256(int256(totalItems) + totalDelta);
        }
        if (activeDelta != 0) {
            activeItems = uint256(int256(activeItems) + activeDelta);
        }
        if (returnedDelta != 0) {
            returnedItems = uint256(int256(returnedItems) + returnedDelta);
        }
        
        // Pack and store
        userStats[user] = totalItems | (activeItems << 16) | (returnedItems << 32);
        
        emit UserStatsUpdated(user, totalItems, activeItems, returnedItems);
    }
    
    // Admin Functions
    
    /**
     * @notice Pause the contract (emergency stop)
     */
    function pause() external {
        require(msg.sender == feeRecipient, "Not authorized");
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external {
        require(msg.sender == feeRecipient, "Not authorized");
        _unpause();
    }
    
    /**
     * @notice Emergency function to resolve disputes or handle edge cases
     * @dev Only for extreme cases where normal flow fails
     */
    function emergencyResolve(
        bytes32 itemId,
        uint256 claimIndex,
        address payable recipient,
        uint256 amount
    ) external {
        require(msg.sender == feeRecipient, "Not authorized");
        require(address(this).balance >= amount, "Insufficient balance");
        
        if (claimIndex < claims[itemId].length) {
            claims[itemId][claimIndex].status = ClaimStatus.Disputed;
            emit ClaimDisputed(itemId, claimIndex, msg.sender, block.timestamp);
        }
        
        if (amount > 0 && recipient != address(0)) {
            (bool success, ) = recipient.call{value: amount}("");
            require(success, "Emergency transfer failed");
        }
    }
}