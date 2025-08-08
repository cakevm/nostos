// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Nostos.sol";

/**
 * @title Nostos Base Test Contract
 * @notice Base test contract providing common utilities, helpers, and setup for all Nostos tests
 * @dev This contract should be inherited by all specific test contracts for the Nostos platform
 */
contract NostosBaseTest is Test {
    // ===========================
    // CONTRACTS & VARIABLES
    // ===========================
    
    Nostos public nostos;
    
    // Test users
    address public owner;
    address public finder;
    address public admin;
    address public user1;
    address public user2;
    address public feeRecipient;
    
    // Constants for testing
    uint256 public constant REGISTRATION_FEE = 0.0005 ether;
    uint256 public constant CLAIM_TIMEOUT = 30 days;
    uint256 public constant TEST_REWARD_AMOUNT = 0.1 ether;
    uint256 public constant LARGE_REWARD_AMOUNT = 1 ether;
    uint256 public constant INITIAL_BALANCE = 10 ether;
    
    // Test data
    bytes32 public testItemId1;
    bytes32 public testItemId2;
    bytes32 public testItemId3;
    bytes public testEncryptedData;
    bytes public testEncryptedContact;
    bytes public alternateEncryptedData;
    bytes public alternateEncryptedContact;
    
    // Events for testing (redeclared for convenience)
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
    
    // ===========================
    // SETUP FUNCTIONS
    // ===========================
    
    function setUp() public virtual {
        // Create test users
        owner = makeAddr("owner");
        finder = makeAddr("finder");
        admin = makeAddr("admin");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        feeRecipient = makeAddr("feeRecipient");
        
        // Fund test users
        vm.deal(owner, INITIAL_BALANCE);
        vm.deal(finder, INITIAL_BALANCE);
        vm.deal(admin, INITIAL_BALANCE);
        vm.deal(user1, INITIAL_BALANCE);
        vm.deal(user2, INITIAL_BALANCE);
        vm.deal(feeRecipient, INITIAL_BALANCE);
        
        // Deploy Nostos contract
        nostos = new Nostos(feeRecipient);
        
        // Setup test data
        _setupTestData();
    }
    
    function _setupTestData() internal {
        testItemId1 = keccak256("test-item-1");
        testItemId2 = keccak256("test-item-2");
        testItemId3 = keccak256("test-item-3");
        
        testEncryptedData = abi.encodePacked(
            "encrypted_item_description_with_reward_info_",
            block.timestamp
        );
        
        testEncryptedContact = abi.encodePacked(
            "encrypted_finder_contact_info_",
            block.timestamp
        );
        
        alternateEncryptedData = abi.encodePacked(
            "alternate_encrypted_item_data_",
            block.timestamp + 1
        );
        
        alternateEncryptedContact = abi.encodePacked(
            "alternate_encrypted_contact_",
            block.timestamp + 1
        );
    }
    
    // ===========================
    // HELPER FUNCTIONS
    // ===========================
    
    /**
     * @notice Register a test item with default parameters
     * @param itemId The item ID to register
     * @param itemOwner The owner of the item
     * @return success Whether the registration was successful
     */
    function registerTestItem(bytes32 itemId, address itemOwner) public returns (bool success) {
        return registerTestItem(itemId, itemOwner, testEncryptedData, REGISTRATION_FEE);
    }
    
    /**
     * @notice Register a test item with custom parameters
     * @param itemId The item ID to register
     * @param itemOwner The owner of the item
     * @param encryptedData The encrypted data for the item
     * @param fee The registration fee to pay
     * @return success Whether the registration was successful
     */
    function registerTestItem(
        bytes32 itemId,
        address itemOwner,
        bytes memory encryptedData,
        uint256 fee
    ) public returns (bool success) {
        vm.startPrank(itemOwner);
        try nostos.registerItem{value: fee}(itemId, encryptedData) {
            success = true;
        } catch {
            success = false;
        }
        vm.stopPrank();
    }
    
    /**
     * @notice Submit a claim for an item with default parameters
     * @param itemId The item ID to claim
     * @param claimFinder The finder submitting the claim
     * @return claimIndex The index of the submitted claim
     */
    function submitTestClaim(bytes32 itemId, address claimFinder) public returns (uint256 claimIndex) {
        return submitTestClaim(itemId, claimFinder, testEncryptedContact);
    }
    
    /**
     * @notice Submit a claim for an item with custom contact info
     * @param itemId The item ID to claim
     * @param claimFinder The finder submitting the claim
     * @param encryptedContact The encrypted contact information
     * @return claimIndex The index of the submitted claim
     */
    function submitTestClaim(
        bytes32 itemId,
        address claimFinder,
        bytes memory encryptedContact
    ) public returns (uint256 claimIndex) {
        uint256 beforeClaimCount = nostos.getClaimCount(itemId);
        
        vm.prank(claimFinder);
        nostos.submitClaim(itemId, encryptedContact);
        
        claimIndex = beforeClaimCount; // Next index
    }
    
    /**
     * @notice Reveal contact info for a claim
     * @param itemId The item ID
     * @param claimIndex The claim index
     * @param itemOwner The owner revealing the contact
     * @param rewardAmount The reward amount to escrow
     */
    function revealTestContactInfo(
        bytes32 itemId,
        uint256 claimIndex,
        address itemOwner,
        uint256 rewardAmount
    ) public {
        vm.prank(itemOwner);
        nostos.revealContactInfo{value: rewardAmount}(itemId, claimIndex);
    }
    
    /**
     * @notice Complete the full flow: register -> claim -> reveal -> confirm
     * @param itemId The item ID to use
     * @param itemOwner The item owner
     * @param itemFinder The item finder
     * @param rewardAmount The reward amount
     * @return claimIndex The claim index created
     */
    function completeFullFlow(
        bytes32 itemId,
        address itemOwner,
        address itemFinder,
        uint256 rewardAmount
    ) public returns (uint256 claimIndex) {
        // Register item
        registerTestItem(itemId, itemOwner);
        
        // Submit claim
        claimIndex = submitTestClaim(itemId, itemFinder);
        
        // Reveal contact info
        revealTestContactInfo(itemId, claimIndex, itemOwner, rewardAmount);
        
        // Confirm return
        vm.prank(itemOwner);
        nostos.confirmReturn(itemId, claimIndex);
    }
    
    /**
     * @notice Generate a unique item ID based on input parameters
     * @param seed A seed value for uniqueness
     * @param sender The sender address
     * @return itemId A unique item ID
     */
    function generateItemId(uint256 seed, address sender) public view returns (bytes32 itemId) {
        return keccak256(abi.encodePacked("item-", seed, sender, block.timestamp));
    }
    
    /**
     * @notice Generate mock encrypted data for testing
     * @param seed A seed value for uniqueness
     * @return encryptedData Mock encrypted data
     */
    function generateEncryptedData(uint256 seed) public pure returns (bytes memory encryptedData) {
        return abi.encodePacked("encrypted_data_", seed, "_reward_info_mock");
    }
    
    /**
     * @notice Generate mock encrypted contact info
     * @param seed A seed value for uniqueness
     * @return encryptedContact Mock encrypted contact info
     */
    function generateEncryptedContact(uint256 seed) public pure returns (bytes memory encryptedContact) {
        return abi.encodePacked("encrypted_contact_", seed, "_finder_info");
    }
    
    // ===========================
    // ASSERTION HELPERS
    // ===========================
    
    /**
     * @notice Assert that an item has the expected status
     * @param itemId The item ID to check
     * @param expectedStatus The expected status
     */
    function assertItemStatus(bytes32 itemId, Nostos.ItemStatus expectedStatus) public view {
        (, Nostos.ItemStatus actualStatus, , , , ) = nostos.getItem(itemId);
        assertEq(uint256(actualStatus), uint256(expectedStatus), "Item status mismatch");
    }
    
    /**
     * @notice Assert that a claim has the expected status
     * @param itemId The item ID
     * @param claimIndex The claim index
     * @param expectedStatus The expected status
     */
    function assertClaimStatus(
        bytes32 itemId,
        uint256 claimIndex,
        Nostos.ClaimStatus expectedStatus
    ) public view {
        (, Nostos.ClaimStatus actualStatus, , , , ) = nostos.getClaim(itemId, claimIndex);
        assertEq(uint256(actualStatus), uint256(expectedStatus), "Claim status mismatch");
    }
    
    /**
     * @notice Assert that an address has the expected balance
     * @param account The account to check
     * @param expectedBalance The expected balance
     */
    function assertBalance(address account, uint256 expectedBalance) public view {
        assertEq(account.balance, expectedBalance, "Balance mismatch");
    }
    
    /**
     * @notice Assert that the fee recipient received the registration fee
     * @param initialBalance The initial balance before the operation
     * @param expectedFee The expected fee amount
     */
    function assertFeeRecipientBalance(uint256 initialBalance, uint256 expectedFee) public view {
        assertEq(
            feeRecipient.balance,
            initialBalance + expectedFee,
            "Fee recipient balance mismatch"
        );
    }
    
    /**
     * @notice Get the current balance of an address
     * @param account The account to check
     * @return balance The current balance
     */
    function getBalance(address account) public view returns (uint256 balance) {
        return account.balance;
    }
    
    // ===========================
    // TIME MANIPULATION HELPERS
    // ===========================
    
    /**
     * @notice Fast forward time to simulate claim timeout
     * @param additionalTime Extra time beyond the timeout (default: 0)
     */
    function fastForwardToTimeout(uint256 additionalTime) public {
        vm.warp(block.timestamp + CLAIM_TIMEOUT + additionalTime + 1);
    }
    
    /**
     * @notice Fast forward time by a specific duration
     * @param duration The time duration to skip
     */
    function fastForwardTime(uint256 duration) public {
        vm.warp(block.timestamp + duration);
    }
    
    // ===========================
    // MODIFIERS FOR TEST SCENARIOS
    // ===========================
    
    /**
     * @dev Modifier to set up a registered item before running a test
     */
    modifier withRegisteredItem(bytes32 itemId, address itemOwner) {
        registerTestItem(itemId, itemOwner);
        _;
    }
    
    /**
     * @dev Modifier to set up a registered item with a pending claim
     */
    modifier withPendingClaim(bytes32 itemId, address itemOwner, address claimFinder) {
        registerTestItem(itemId, itemOwner);
        submitTestClaim(itemId, claimFinder);
        _;
    }
    
    /**
     * @dev Modifier to set up a claim with revealed contact info
     */
    modifier withRevealedClaim(
        bytes32 itemId,
        address itemOwner,
        address claimFinder,
        uint256 rewardAmount
    ) {
        registerTestItem(itemId, itemOwner);
        uint256 claimIndex = submitTestClaim(itemId, claimFinder);
        revealTestContactInfo(itemId, claimIndex, itemOwner, rewardAmount);
        _;
    }
    
    /**
     * @dev Modifier to simulate timeout conditions
     */
    modifier afterTimeout() {
        fastForwardToTimeout(1);
        _;
    }
    
    /**
     * @dev Modifier to run test as a specific user
     */
    modifier asUser(address user) {
        vm.startPrank(user);
        _;
        vm.stopPrank();
    }
    
    // ===========================
    // CONTRACT STATE UTILITIES
    // ===========================
    
    /**
     * @notice Get the current state of an item
     * @param itemId The item ID to check
     * @return itemOwner The address of the item owner
     * @return status The current status of the item
     * @return registrationTime The timestamp when the item was registered
     * @return lastActivity The timestamp of the last activity on the item
     * @return stake The amount staked for the item registration
     * @return encryptedData The encrypted data associated with the item
     */
    function getItemState(bytes32 itemId) public view returns (
        address itemOwner,
        Nostos.ItemStatus status,
        uint64 registrationTime,
        uint64 lastActivity,
        uint256 stake,
        bytes memory encryptedData
    ) {
        return nostos.getItem(itemId);
    }
    
    /**
     * @notice Get the current state of a claim
     * @param itemId The item ID
     * @param claimIndex The claim index
     * @return claimFinder The address of the finder who submitted the claim
     * @return status The current status of the claim
     * @return timestamp The timestamp when the claim was submitted
     * @return revealDeadline The deadline for revealing contact information
     * @return escrowAmount The amount escrowed for the claim
     * @return encryptedContact The encrypted contact information from the finder
     */
    function getClaimState(bytes32 itemId, uint256 claimIndex) public view returns (
        address claimFinder,
        Nostos.ClaimStatus status,
        uint64 timestamp,
        uint64 revealDeadline,
        uint256 escrowAmount,
        bytes memory encryptedContact
    ) {
        return nostos.getClaim(itemId, claimIndex);
    }
    
    /**
     * @notice Check if a claim has expired
     * @param itemId The item ID
     * @param claimIndex The claim index
     * @return expired Whether the claim has expired
     */
    function isClaimExpired(bytes32 itemId, uint256 claimIndex) public view returns (bool expired) {
        (, , , uint64 revealDeadline, , ) = nostos.getClaim(itemId, claimIndex);
        return block.timestamp > revealDeadline;
    }
    
    /**
     * @notice Get contract's balance
     * @return balance The contract's current balance
     */
    function getContractBalance() public view returns (uint256 balance) {
        return address(nostos).balance;
    }
    
    // ===========================
    // ERROR TESTING HELPERS
    // ===========================
    
    /**
     * @notice Expect a specific custom error to be thrown
     * @param errorSelector The error selector to expect
     */
    function expectCustomError(bytes4 errorSelector) public {
        vm.expectRevert(errorSelector);
    }
    
    /**
     * @notice Common error selectors for convenience
     */
    function getInsufficientFeeError() public pure returns (bytes4) {
        return Nostos.InsufficientFee.selector;
    }
    
    function getItemNotFoundError() public pure returns (bytes4) {
        return Nostos.ItemNotFound.selector;
    }
    
    function getNotItemOwnerError() public pure returns (bytes4) {
        return Nostos.NotItemOwner.selector;
    }
    
    function getNotFinderError() public pure returns (bytes4) {
        return Nostos.NotFinder.selector;
    }
    
    function getItemAlreadyExistsError() public pure returns (bytes4) {
        return Nostos.ItemAlreadyExists.selector;
    }
    
    function getEmptyDataError() public pure returns (bytes4) {
        return Nostos.EmptyData.selector;
    }
    
    function getInvalidStatusError() public pure returns (bytes4) {
        return Nostos.InvalidStatus.selector;
    }
    
    function getInsufficientEscrowError() public pure returns (bytes4) {
        return Nostos.InsufficientEscrow.selector;
    }
    
    function getClaimExpiredError() public pure returns (bytes4) {
        return Nostos.ClaimExpired.selector;
    }
    
    function getNoActiveClaimError() public pure returns (bytes4) {
        return Nostos.NoActiveClaim.selector;
    }
}