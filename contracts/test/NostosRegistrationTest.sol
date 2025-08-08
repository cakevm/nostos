// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Nostos.Base.t.sol";

/**
 * @title Nostos Registration Test Suite
 * @notice Comprehensive tests for item registration functionality
 * @dev Tests all aspects of the registerItem function and related edge cases
 */
contract NostosRegistrationTest is NostosBaseTest {
    address public owner1;
    address public owner2;
    address public finder1;
    
    uint256 public constant INSUFFICIENT_FEE = 0.0001 ether;
    uint256 public constant EXCESS_FEE = 0.001 ether;
    
    bytes32 public constant ITEM_ID_1 = keccak256("test-item-1");
    bytes32 public constant ITEM_ID_2 = keccak256("test-item-2");
    bytes32 public constant DUPLICATE_ITEM_ID = keccak256("duplicate-item");
    
    bytes public constant VALID_ENCRYPTED_DATA = "encrypted_item_data_with_reward_info";
    bytes public constant EMPTY_ENCRYPTED_DATA = "";
    
    function setUp() public override {
        super.setUp();
        
        // Set up additional test addresses
        owner1 = makeAddr("owner1");
        owner2 = makeAddr("owner2");
        finder1 = makeAddr("finder1");
        
        // Fund test addresses
        vm.deal(owner1, 10 ether);
        vm.deal(owner2, 10 ether);
        vm.deal(finder1, 10 ether);
    }
    
    /*//////////////////////////////////////////////////////////////
                        SUCCESSFUL REGISTRATION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItem_SuccessfulWithCorrectFee() public {
        uint256 initialFeeRecipientBalance = feeRecipient.balance;
        uint256 initialOwnerBalance = owner1.balance;
        
        vm.startPrank(owner1);
        
        // Register item (events are tested separately)
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        vm.stopPrank();
        
        // Verify item was registered correctly
        (
            address itemOwner,
            Nostos.ItemStatus status,
            uint64 registrationTime,
            uint64 lastActivity,
            uint256 stake,
            bytes memory encryptedData
        ) = nostos.getItem(ITEM_ID_1);
        
        assertEq(itemOwner, owner1);
        assertEq(uint256(status), uint256(Nostos.ItemStatus.Active));
        assertEq(registrationTime, block.timestamp);
        assertEq(lastActivity, block.timestamp);
        assertEq(stake, REGISTRATION_FEE - 0.0001 ether);  // Stake after platform fee
        assertEq(encryptedData, VALID_ENCRYPTED_DATA);
        
        // Verify fee transfer (only platform fee)
        assertEq(feeRecipient.balance, initialFeeRecipientBalance + 0.0001 ether);
        assertEq(owner1.balance, initialOwnerBalance - REGISTRATION_FEE);
        
        // Verify user items tracking
        bytes32[] memory userItems = nostos.getUserItems(owner1);
        assertEq(userItems.length, 1);
        assertEq(userItems[0], ITEM_ID_1);
        
        // Verify user stats (note: contract bug - activeItems not incremented on registration)
        uint256 stats = nostos.getUserStats(owner1);
        uint256 totalItems = stats & 0xFFFF;
        uint256 activeItems = (stats >> 16) & 0xFFFF;
        uint256 returnedItems = (stats >> 32) & 0xFFFF;
        
        assertEq(totalItems, 1);
        assertEq(activeItems, 1); // Now correctly incremented
        assertEq(returnedItems, 0);
    }
    
    function test_RegisterItem_SuccessfulWithExcessFee() public {
        uint256 initialFeeRecipientBalance = feeRecipient.balance;
        uint256 initialOwnerBalance = owner1.balance;
        
        vm.startPrank(owner1);
        
        // Register item with excess fee
        nostos.registerItem{value: EXCESS_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        vm.stopPrank();
        
        // Verify item was registered correctly with excess fee stored as stake
        (,,,, uint256 stake,) = nostos.getItem(ITEM_ID_1);
        assertEq(stake, EXCESS_FEE - 0.0001 ether);  // Excess minus platform fee
        
        // Verify fee transfer (only platform fee is transferred)
        assertEq(feeRecipient.balance, initialFeeRecipientBalance + 0.0001 ether);
        assertEq(owner1.balance, initialOwnerBalance - EXCESS_FEE);
    }
    
    /*//////////////////////////////////////////////////////////////
                        FAILURE TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItem_FailsWithInsufficientFee() public {
        vm.startPrank(owner1);
        
        vm.expectRevert(Nostos.InsufficientFee.selector);
        nostos.registerItem{value: INSUFFICIENT_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        vm.stopPrank();
        
        // Verify item was not registered
        (address itemOwner,,,,,) = nostos.getItem(ITEM_ID_1);
        assertEq(itemOwner, address(0));
    }
    
    function test_RegisterItem_FailsWithZeroFee() public {
        vm.startPrank(owner1);
        
        vm.expectRevert(Nostos.InsufficientFee.selector);
        nostos.registerItem{value: 0}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        vm.stopPrank();
    }
    
    function test_RegisterItem_FailsWithDuplicateItemId() public {
        vm.startPrank(owner1);
        
        // Register item first time
        nostos.registerItem{value: REGISTRATION_FEE}(DUPLICATE_ITEM_ID, VALID_ENCRYPTED_DATA);
        
        // Try to register same item ID again
        vm.expectRevert(Nostos.ItemAlreadyExists.selector);
        nostos.registerItem{value: REGISTRATION_FEE}(DUPLICATE_ITEM_ID, VALID_ENCRYPTED_DATA);
        
        vm.stopPrank();
    }
    
    function test_RegisterItem_FailsWithDuplicateItemIdDifferentOwner() public {
        // Owner1 registers item
        vm.prank(owner1);
        nostos.registerItem{value: REGISTRATION_FEE}(DUPLICATE_ITEM_ID, VALID_ENCRYPTED_DATA);
        
        // Owner2 tries to register same item ID
        vm.startPrank(owner2);
        
        vm.expectRevert(Nostos.ItemAlreadyExists.selector);
        nostos.registerItem{value: REGISTRATION_FEE}(DUPLICATE_ITEM_ID, VALID_ENCRYPTED_DATA);
        
        vm.stopPrank();
    }
    
    function test_RegisterItem_FailsWithEmptyEncryptedData() public {
        vm.startPrank(owner1);
        
        vm.expectRevert(Nostos.EmptyData.selector);
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, EMPTY_ENCRYPTED_DATA);
        
        vm.stopPrank();
    }
    
    /*//////////////////////////////////////////////////////////////
                        MULTIPLE REGISTRATIONS TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_MultipleItemRegistrations_SameUser() public {
        vm.startPrank(owner1);
        
        // Register multiple items
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_2, VALID_ENCRYPTED_DATA);
        
        vm.stopPrank();
        
        // Verify both items are registered
        (address owner1Item1,,,,,) = nostos.getItem(ITEM_ID_1);
        (address owner1Item2,,,,,) = nostos.getItem(ITEM_ID_2);
        
        assertEq(owner1Item1, owner1);
        assertEq(owner1Item2, owner1);
        
        // Verify user items tracking
        bytes32[] memory userItems = nostos.getUserItems(owner1);
        assertEq(userItems.length, 2);
        assertEq(userItems[0], ITEM_ID_1);
        assertEq(userItems[1], ITEM_ID_2);
        
        // Verify user stats (note: contract bug - activeItems not incremented)
        uint256 stats = nostos.getUserStats(owner1);
        uint256 totalItems = stats & 0xFFFF;
        uint256 activeItems = (stats >> 16) & 0xFFFF;
        
        assertEq(totalItems, 2);
        assertEq(activeItems, 2); // Now correctly incremented (2 items registered)
    }
    
    function test_MultipleItemRegistrations_DifferentUsers() public {
        // Owner1 registers item
        vm.prank(owner1);
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        // Owner2 registers different item
        vm.prank(owner2);
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_2, VALID_ENCRYPTED_DATA);
        
        // Verify both items are registered to correct owners
        (address owner1Item,,,,,) = nostos.getItem(ITEM_ID_1);
        (address owner2Item,,,,,) = nostos.getItem(ITEM_ID_2);
        
        assertEq(owner1Item, owner1);
        assertEq(owner2Item, owner2);
        
        // Verify user items tracking for both owners
        bytes32[] memory owner1Items = nostos.getUserItems(owner1);
        bytes32[] memory owner2Items = nostos.getUserItems(owner2);
        
        assertEq(owner1Items.length, 1);
        assertEq(owner1Items[0], ITEM_ID_1);
        assertEq(owner2Items.length, 1);
        assertEq(owner2Items[0], ITEM_ID_2);
    }
    
    /*//////////////////////////////////////////////////////////////
                        EVENT EMISSION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItem_EmitsCorrectEvents() public {
        vm.startPrank(owner1);
        
        // UserStatsUpdated event is emitted first (from _updateUserStats call)
        vm.expectEmit(true, false, false, true);
        emit UserStatsUpdated(owner1, 1, 1, 0);  // Now increments active items
        
        // Then ItemRegistered event is emitted
        vm.expectEmit(true, true, false, true);
        emit ItemRegistered(
            ITEM_ID_1,
            owner1,
            REGISTRATION_FEE - 0.0001 ether,  // Stake after platform fee
            block.timestamp,
            VALID_ENCRYPTED_DATA
        );
        
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        vm.stopPrank();
    }
    
    /*//////////////////////////////////////////////////////////////
                        FEE TRANSFER TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItem_FeeTransferToRecipient() public {
        uint256 initialBalance = feeRecipient.balance;
        
        vm.prank(owner1);
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        // Only platform fee (0.0001 ether) should be transferred, rest stays as stake
        assertEq(feeRecipient.balance, initialBalance + 0.0001 ether);
    }
    
    function test_RegisterItem_FeeTransferWithExcessAmount() public {
        uint256 initialBalance = feeRecipient.balance;
        
        vm.prank(owner1);
        nostos.registerItem{value: EXCESS_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        // Only platform fee (0.0001 ether) should be transferred, rest stays as stake
        assertEq(feeRecipient.balance, initialBalance + 0.0001 ether);
        
        // Verify the stake amount is correct
        (,,,, uint256 stake,) = nostos.getItem(ITEM_ID_1);
        assertEq(stake, EXCESS_FEE - 0.0001 ether);
    }
    
    /*//////////////////////////////////////////////////////////////
                        PAUSE FUNCTIONALITY TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItem_FailsWhenPaused() public {
        // Pause contract
        vm.prank(feeRecipient);
        nostos.pause();
        
        // Try to register item while paused
        vm.startPrank(owner1);
        
        vm.expectRevert(); // OpenZeppelin 5.x uses EnforcedPause() custom error
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        vm.stopPrank();
    }
    
    function test_RegisterItem_WorksAfterUnpause() public {
        // Pause and unpause contract
        vm.prank(feeRecipient);
        nostos.pause();
        
        vm.prank(feeRecipient);
        nostos.unpause();
        
        // Should work normally after unpause
        vm.prank(owner1);
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        (address itemOwner,,,,,) = nostos.getItem(ITEM_ID_1);
        assertEq(itemOwner, owner1);
    }
    
    /*//////////////////////////////////////////////////////////////
                        REENTRANCY TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItem_ReentrancyProtection() public {
        // Create a malicious fee recipient that tries to re-enter
        MaliciousFeeRecipient maliciousFeeRecipient = new MaliciousFeeRecipient();
        Nostos maliciousNostos = new Nostos(address(maliciousFeeRecipient));
        maliciousFeeRecipient.setNostos(maliciousNostos);
        
        vm.deal(owner1, 10 ether);
        vm.deal(address(maliciousFeeRecipient), 10 ether); // Give it funds to attempt reentrancy
        
        // The malicious contract should fail when trying to re-enter
        vm.prank(owner1);
        vm.expectRevert(); // Could be either reentrancy guard or fee transfer failure
        maliciousNostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
    }
    
    /*//////////////////////////////////////////////////////////////
                        GAS OPTIMIZATION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItem_GasConsumption() public {
        vm.prank(owner1);
        
        uint256 gasBefore = gasleft();
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        uint256 gasAfter = gasleft();
        
        uint256 gasUsed = gasBefore - gasAfter;
        
        // Gas usage should be reasonable (adjust threshold as needed)
        // This is a baseline test to catch gas regressions
        assertLt(gasUsed, 250000); // Adjusted based on actual usage
    }
    
    function test_RegisterItem_MultipleRegistrations_GasEfficiency() public {
        vm.startPrank(owner1);
        
        // First registration (includes storage initialization overhead)
        uint256 gas1Before = gasleft();
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        uint256 gas1After = gasleft();
        uint256 firstRegisterGas = gas1Before - gas1After;
        
        // Second registration (should be more efficient)
        bytes32 secondItemId = keccak256("second-item");
        uint256 gas2Before = gasleft();
        nostos.registerItem{value: REGISTRATION_FEE}(secondItemId, VALID_ENCRYPTED_DATA);
        uint256 gas2After = gasleft();
        uint256 secondRegisterGas = gas2Before - gas2After;
        
        vm.stopPrank();
        
        // Second registration should use less gas than first (no userStats initialization)
        assertLt(secondRegisterGas, firstRegisterGas);
    }
    
    /*//////////////////////////////////////////////////////////////
                        EDGE CASES AND VALIDATION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItem_TimestampAccuracy() public {
        uint256 beforeTimestamp = block.timestamp;
        
        vm.prank(owner1);
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        (,, uint64 registrationTime, uint64 lastActivity,,) = nostos.getItem(ITEM_ID_1);
        
        // Timestamps should match current block timestamp
        assertEq(registrationTime, beforeTimestamp);
        assertEq(lastActivity, beforeTimestamp);
    }
    
    function test_RegisterItem_LargeEncryptedData() public {
        // Test with large encrypted data
        bytes memory largeData = new bytes(10000);
        for (uint256 i = 0; i < largeData.length; i++) {
            largeData[i] = bytes1(uint8(i % 256));
        }
        
        vm.prank(owner1);
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, largeData);
        
        (,,,, , bytes memory storedData) = nostos.getItem(ITEM_ID_1);
        assertEq(storedData.length, largeData.length);
        assertEq(keccak256(storedData), keccak256(largeData));
    }
    
    function test_GetRegistrationFee_ReturnsCorrectValue() public view {
        uint256 fee = nostos.getRegistrationFee();
        assertEq(fee, REGISTRATION_FEE);
    }
    
    /*//////////////////////////////////////////////////////////////
                        BOUNDARY TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItem_ExactMinimumFee() public {
        vm.prank(owner1);
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        (,,,, uint256 stake,) = nostos.getItem(ITEM_ID_1);
        assertEq(stake, REGISTRATION_FEE - 0.0001 ether);  // Stake after platform fee
    }
    
    function test_RegisterItem_JustBelowMinimumFee() public {
        vm.startPrank(owner1);
        
        vm.expectRevert(Nostos.InsufficientFee.selector);
        nostos.registerItem{value: REGISTRATION_FEE - 1}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        vm.stopPrank();
    }
    
    /*//////////////////////////////////////////////////////////////
                        INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItem_FullWorkflow() public {
        // Test the complete registration workflow
        uint256 initialOwnerBalance = owner1.balance;
        uint256 initialFeeBalance = feeRecipient.balance;
        
        vm.prank(owner1);
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, VALID_ENCRYPTED_DATA);
        
        // Verify all state changes
        (
            address itemOwner,
            Nostos.ItemStatus status,
            uint64 registrationTime,
            uint64 lastActivity,
            uint256 stake,
            bytes memory encryptedData
        ) = nostos.getItem(ITEM_ID_1);
        
        // Verify item details
        assertEq(itemOwner, owner1);
        assertEq(uint256(status), uint256(Nostos.ItemStatus.Active));
        assertEq(registrationTime, block.timestamp);
        assertEq(lastActivity, block.timestamp);
        assertEq(stake, REGISTRATION_FEE - 0.0001 ether);  // Stake after platform fee
        assertEq(encryptedData, VALID_ENCRYPTED_DATA);
        
        // Verify balances
        assertEq(owner1.balance, initialOwnerBalance - REGISTRATION_FEE);
        assertEq(feeRecipient.balance, initialFeeBalance + 0.0001 ether);  // Only platform fee
        
        // Verify tracking arrays
        bytes32[] memory userItems = nostos.getUserItems(owner1);
        assertEq(userItems.length, 1);
        assertEq(userItems[0], ITEM_ID_1);
        
        // Verify stats
        uint256 stats = nostos.getUserStats(owner1);
        assertEq(stats & 0xFFFF, 1); // total items
        assertEq((stats >> 16) & 0xFFFF, 1); // active items (now correctly incremented)
        assertEq((stats >> 32) & 0xFFFF, 0); // returned items
    }
    
    /*//////////////////////////////////////////////////////////////
                        HELPER TESTS USING BASE FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    function test_RegisterItemUsingHelper() public {
        bool success = registerTestItem(ITEM_ID_1, owner1);
        assertTrue(success);
        
        assertItemStatus(ITEM_ID_1, Nostos.ItemStatus.Active);
    }
    
    function test_RegisterItemUsingHelperWithCustomData() public {
        bytes memory customData = generateEncryptedData(123);
        bool success = registerTestItem(ITEM_ID_1, owner1, customData, REGISTRATION_FEE);
        assertTrue(success);
        
        (,,,,,bytes memory storedData) = nostos.getItem(ITEM_ID_1);
        assertEq(keccak256(storedData), keccak256(customData));
    }
}

/**
 * @notice Malicious fee recipient for reentrancy testing
 */
contract MaliciousFeeRecipient {
    Nostos public nostos;
    bool public hasAttacked;
    
    function setNostos(Nostos _nostos) external {
        nostos = _nostos;
    }
    
    // This receive function tries to re-enter during fee transfer
    receive() external payable {
        if (!hasAttacked && address(this).balance >= 0.0005 ether) {
            hasAttacked = true;
            // Try to register another item during the fee transfer
            nostos.registerItem{value: 0.0005 ether}(keccak256("reentrant-attack"), "attack-data");
        }
    }
}