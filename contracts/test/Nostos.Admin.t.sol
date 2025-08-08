// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Nostos.Base.t.sol";

/**
 * @title Admin Functions Test for Nostos Contract
 * @notice Comprehensive tests for admin privileges and access control
 */
contract NostosAdminTest is NostosBaseTest {
    
    // Additional test users for admin tests
    address public finder1;
    address public finder2;
    address public unauthorized;
    
    // Test constants
    bytes32 public constant ITEM_ID_1 = keccak256("item1");
    bytes32 public constant ITEM_ID_2 = keccak256("item2");
    bytes public constant ENCRYPTED_DATA = "encrypted_item_data";
    bytes public constant ENCRYPTED_CONTACT = "encrypted_contact_info";
    uint256 public constant REWARD_AMOUNT = 0.1 ether;
    
    // Events for testing
    event Paused(address account);
    event Unpaused(address account);
    event ClaimDisputed(
        bytes32 indexed itemId,
        uint256 indexed claimIndex,
        address indexed disputer,
        uint256 timestamp
    );
    
    function setUp() public override {
        super.setUp();
        
        // Create additional test users for admin tests
        finder1 = makeAddr("finder1");
        finder2 = makeAddr("finder2");
        unauthorized = makeAddr("unauthorized");
        
        // Fund additional test users
        vm.deal(finder1, INITIAL_BALANCE);
        vm.deal(finder2, INITIAL_BALANCE);
        vm.deal(unauthorized, INITIAL_BALANCE);
    }
    
    // ============ Constructor Tests ============
    
    function testConstructor_ValidFeeRecipient() public {
        Nostos testNostos = new Nostos(feeRecipient);
        assertEq(testNostos.feeRecipient(), feeRecipient);
        assertEq(testNostos.deploymentChainId(), block.chainid);
    }
    
    function testConstructor_ZeroAddressFeeRecipient() public {
        vm.expectRevert("Invalid fee recipient");
        new Nostos(address(0));
    }
    
    function testConstructor_ChainIdVerification() public {
        uint256 originalChainId = block.chainid;
        
        // Deploy on current chain
        Nostos testNostos = new Nostos(feeRecipient);
        assertEq(testNostos.deploymentChainId(), originalChainId);
        
        // Simulate different chain ID
        vm.chainId(999);
        Nostos testNostos2 = new Nostos(feeRecipient);
        assertEq(testNostos2.deploymentChainId(), 999);
        
        // Reset chain ID
        vm.chainId(originalChainId);
    }
    
    // ============ Pause Functionality Tests ============
    
    function testPause_ByAuthorizedFeeRecipient() public {
        // Initially not paused
        assertFalse(nostos.paused());
        
        // Fee recipient can pause
        vm.prank(feeRecipient);
        nostos.pause();
        
        assertTrue(nostos.paused());
    }
    
    function testPause_ByUnauthorizedUser() public {
        // Unauthorized user cannot pause
        vm.prank(unauthorized);
        vm.expectRevert("Not authorized");
        nostos.pause();
        
        // Contract should remain unpaused
        assertFalse(nostos.paused());
    }
    
    function testPause_EmitsPausedEvent() public {
        vm.expectEmit(true, false, false, false);
        emit Paused(feeRecipient);
        
        vm.prank(feeRecipient);
        nostos.pause();
    }
    
    // ============ Unpause Functionality Tests ============
    
    function testUnpause_ByAuthorizedFeeRecipient() public {
        // First pause the contract
        vm.prank(feeRecipient);
        nostos.pause();
        assertTrue(nostos.paused());
        
        // Fee recipient can unpause
        vm.prank(feeRecipient);
        nostos.unpause();
        
        assertFalse(nostos.paused());
    }
    
    function testUnpause_ByUnauthorizedUser() public {
        // First pause the contract
        vm.prank(feeRecipient);
        nostos.pause();
        assertTrue(nostos.paused());
        
        // Unauthorized user cannot unpause
        vm.prank(unauthorized);
        vm.expectRevert("Not authorized");
        nostos.unpause();
        
        // Contract should remain paused
        assertTrue(nostos.paused());
    }
    
    function testUnpause_EmitsUnpausedEvent() public {
        // First pause
        vm.prank(feeRecipient);
        nostos.pause();
        
        vm.expectEmit(true, false, false, false);
        emit Unpaused(feeRecipient);
        
        vm.prank(feeRecipient);
        nostos.unpause();
    }
    
    // ============ Operations Fail When Paused Tests ============
    
    function testRegisterItem_FailsWhenPaused() public {
        // Pause contract
        vm.prank(feeRecipient);
        nostos.pause();
        
        // Registration should fail
        vm.prank(user1);
        vm.expectRevert();
        nostos.registerItem{value: REGISTRATION_FEE}(ITEM_ID_1, ENCRYPTED_DATA);
    }
    
    function testSubmitClaim_FailsWhenPaused() public {
        // Register item first
        registerTestItem(ITEM_ID_1, user1);
        
        // Pause contract
        vm.prank(feeRecipient);
        nostos.pause();
        
        // Claim submission should fail
        vm.prank(finder1);
        vm.expectRevert();
        nostos.submitClaim(ITEM_ID_1, ENCRYPTED_CONTACT);
    }
    
    function testRevealContactInfo_FailsWhenPaused() public {
        // Set up item and claim
        registerTestItem(ITEM_ID_1, user1);
        submitTestClaim(ITEM_ID_1, finder1);
        
        // Pause contract
        vm.prank(feeRecipient);
        nostos.pause();
        
        // Reveal should fail
        vm.prank(user1);
        vm.expectRevert();
        nostos.revealContactInfo{value: REWARD_AMOUNT}(ITEM_ID_1, 0);
    }
    
    function testConfirmReturn_FailsWhenPaused() public {
        // Set up item, claim, and reveal
        registerTestItem(ITEM_ID_1, user1);
        submitTestClaim(ITEM_ID_1, finder1);
        revealTestContactInfo(ITEM_ID_1, 0, user1, REWARD_AMOUNT);
        
        // Pause contract
        vm.prank(feeRecipient);
        nostos.pause();
        
        // Confirm return should fail
        vm.prank(user1);
        vm.expectRevert();
        nostos.confirmReturn(ITEM_ID_1, 0);
    }
    
    // ============ View Functions Work When Paused Tests ============
    
    function testViewFunctions_WorkWhenPaused() public {
        // Register item and create claim
        registerTestItem(ITEM_ID_1, user1);
        submitTestClaim(ITEM_ID_1, finder1);
        
        // Pause contract
        vm.prank(feeRecipient);
        nostos.pause();
        
        // View functions should still work
        (address itemOwner, Nostos.ItemStatus status, , , , bytes memory data) = nostos.getItem(ITEM_ID_1);
        assertEq(itemOwner, user1);
        assertEq(uint(status), uint(Nostos.ItemStatus.HasClaims));
        assertEq(data, testEncryptedData);
        
        // Get claim info
        (address claimFinder, Nostos.ClaimStatus claimStatus, , , , bytes memory contact) = nostos.getClaim(ITEM_ID_1, 0);
        assertEq(claimFinder, finder1);
        assertEq(uint(claimStatus), uint(Nostos.ClaimStatus.Pending));
        assertEq(contact, testEncryptedContact);
        
        // Other view functions
        assertEq(nostos.getClaimCount(ITEM_ID_1), 1);
        assertEq(nostos.getUserItems(user1).length, 1);
        assertEq(nostos.getFinderClaims(finder1).length, 1);
        assertEq(nostos.getRegistrationFee(), REGISTRATION_FEE);
    }
    
    // ============ Emergency Resolve Function Tests ============
    
    function testEmergencyResolve_ByAdmin() public {
        // Set up scenario with claim and escrow
        registerTestItem(ITEM_ID_1, user1);
        submitTestClaim(ITEM_ID_1, finder1);
        revealTestContactInfo(ITEM_ID_1, 0, user1, REWARD_AMOUNT);
        
        uint256 initialBalance = finder1.balance;
        uint256 contractBalance = address(nostos).balance;
        
        // Fee recipient can emergency resolve
        vm.expectEmit(true, true, true, true);
        emit ClaimDisputed(ITEM_ID_1, 0, feeRecipient, block.timestamp);
        
        vm.prank(feeRecipient);
        nostos.emergencyResolve(ITEM_ID_1, 0, payable(finder1), REWARD_AMOUNT);
        
        // Check claim status updated to disputed
        (, Nostos.ClaimStatus claimStatus, , , , ) = nostos.getClaim(ITEM_ID_1, 0);
        assertEq(uint(claimStatus), uint(Nostos.ClaimStatus.Disputed));
        
        // Check funds transferred
        assertEq(finder1.balance, initialBalance + REWARD_AMOUNT);
        assertEq(address(nostos).balance, contractBalance - REWARD_AMOUNT);
    }
    
    function testEmergencyResolve_ByNonAdmin() public {
        // Set up scenario
        registerTestItem(ITEM_ID_1, user1);
        submitTestClaim(ITEM_ID_1, finder1);
        
        // Non-admin cannot emergency resolve
        vm.prank(unauthorized);
        vm.expectRevert("Not authorized");
        nostos.emergencyResolve(ITEM_ID_1, 0, payable(finder1), REWARD_AMOUNT);
    }
    
    function testEmergencyResolve_WithDisputeStatusUpdate() public {
        // Set up scenario
        registerTestItem(ITEM_ID_1, user1);
        submitTestClaim(ITEM_ID_1, finder1);
        
        // Emergency resolve with valid claim index should update status
        vm.expectEmit(true, true, true, true);
        emit ClaimDisputed(ITEM_ID_1, 0, feeRecipient, block.timestamp);
        
        vm.prank(feeRecipient);
        nostos.emergencyResolve(ITEM_ID_1, 0, payable(address(0)), 0);
        
        (, Nostos.ClaimStatus claimStatus, , , , ) = nostos.getClaim(ITEM_ID_1, 0);
        assertEq(uint(claimStatus), uint(Nostos.ClaimStatus.Disputed));
    }
    
    function testEmergencyResolve_WithFundTransfer() public {
        // Fund the contract first
        registerTestItem(ITEM_ID_1, user1);
        submitTestClaim(ITEM_ID_1, finder1);
        revealTestContactInfo(ITEM_ID_1, 0, user1, REWARD_AMOUNT);
        
        uint256 initialBalance = finder2.balance;
        uint256 transferAmount = 0.05 ether;
        
        // Emergency resolve with fund transfer
        vm.prank(feeRecipient);
        nostos.emergencyResolve(ITEM_ID_1, 0, payable(finder2), transferAmount);
        
        assertEq(finder2.balance, initialBalance + transferAmount);
    }
    
    function testEmergencyResolve_WithZeroAmount() public {
        // Set up scenario
        registerTestItem(ITEM_ID_1, user1);
        submitTestClaim(ITEM_ID_1, finder1);
        
        uint256 initialBalance = finder1.balance;
        
        // Emergency resolve with zero amount (no transfer)
        vm.prank(feeRecipient);
        nostos.emergencyResolve(ITEM_ID_1, 0, payable(finder1), 0);
        
        // No fund transfer should occur
        assertEq(finder1.balance, initialBalance);
        
        // Status should still be updated if valid claim index
        (, Nostos.ClaimStatus claimStatus, , , , ) = nostos.getClaim(ITEM_ID_1, 0);
        assertEq(uint(claimStatus), uint(Nostos.ClaimStatus.Disputed));
    }
    
    function testEmergencyResolve_WithInsufficientBalance() public {
        // Set up scenario with minimal contract balance
        registerTestItem(ITEM_ID_1, user1);
        submitTestClaim(ITEM_ID_1, finder1);
        
        uint256 contractBalance = address(nostos).balance;
        uint256 excessiveAmount = contractBalance + 1 ether;
        
        // Should revert with insufficient balance
        vm.prank(feeRecipient);
        vm.expectRevert("Insufficient balance");
        nostos.emergencyResolve(ITEM_ID_1, 0, payable(finder1), excessiveAmount);
    }
    
    function testEmergencyResolve_WithInvalidClaimIndex() public {
        // Set up scenario
        registerTestItem(ITEM_ID_1, user1);
        // No claims submitted
        
        // Emergency resolve with invalid claim index should not update status
        // but should not revert if amount and recipient are valid
        vm.prank(feeRecipient);
        nostos.emergencyResolve(ITEM_ID_1, 999, payable(finder1), 0);
        
        // Should complete without error (no claim to update)
        // Contract balance should remain the same since amount is 0
    }
    
    function testEmergencyResolve_TransferFailure() public {
        // Set up scenario
        registerTestItem(ITEM_ID_1, user1);
        submitTestClaim(ITEM_ID_1, finder1);
        revealTestContactInfo(ITEM_ID_1, 0, user1, REWARD_AMOUNT);
        
        // Deploy a contract that rejects payments
        RejectPayments rejector = new RejectPayments();
        
        // Emergency resolve to rejecting contract should fail
        vm.prank(feeRecipient);
        vm.expectRevert("Emergency transfer failed");
        nostos.emergencyResolve(ITEM_ID_1, 0, payable(address(rejector)), REWARD_AMOUNT);
    }
    
    // ============ Access Control Edge Cases ============
    
    function testMultipleAdminOperations() public {
        // Test multiple pause/unpause cycles
        vm.startPrank(feeRecipient);
        
        nostos.pause();
        assertTrue(nostos.paused());
        
        nostos.unpause();
        assertFalse(nostos.paused());
        
        nostos.pause();
        assertTrue(nostos.paused());
        
        nostos.unpause();
        assertFalse(nostos.paused());
        
        vm.stopPrank();
    }
    
    function testPauseWhenAlreadyPaused() public {
        vm.startPrank(feeRecipient);
        
        // First pause
        nostos.pause();
        assertTrue(nostos.paused());
        
        // Second pause should revert
        vm.expectRevert();
        nostos.pause();
        
        vm.stopPrank();
    }
    
    function testUnpauseWhenNotPaused() public {
        vm.startPrank(feeRecipient);
        
        // Unpause when not paused should revert
        vm.expectRevert();
        nostos.unpause();
        
        vm.stopPrank();
    }
    
    function testAdminFunctionsWithDifferentAddresses() public {
        address admin2 = makeAddr("admin2");
        
        // Deploy contract with different admin
        Nostos nostos2 = new Nostos(admin2);
        
        // Original fee recipient cannot control new contract
        vm.prank(feeRecipient);
        vm.expectRevert("Not authorized");
        nostos2.pause();
        
        // New admin can control new contract
        vm.prank(admin2);
        nostos2.pause();
        assertTrue(nostos2.paused());
    }
    
    // ============ Integration Tests ============
    
    function testCompleteWorkflowWithPauseUnpause() public {
        // Register item
        registerTestItem(ITEM_ID_1, user1);
        
        // Submit claim
        submitTestClaim(ITEM_ID_1, finder1);
        
        // Pause contract
        vm.prank(feeRecipient);
        nostos.pause();
        
        // Operations should fail while paused
        vm.prank(user1);
        vm.expectRevert();
        nostos.revealContactInfo{value: REWARD_AMOUNT}(ITEM_ID_1, 0);
        
        // Unpause contract
        vm.prank(feeRecipient);
        nostos.unpause();
        
        // Operations should work again
        revealTestContactInfo(ITEM_ID_1, 0, user1, REWARD_AMOUNT);
        vm.prank(user1);
        nostos.confirmReturn(ITEM_ID_1, 0);
        
        // Verify final state
        (, Nostos.ItemStatus itemStatus, , , , ) = nostos.getItem(ITEM_ID_1);
        assertEq(uint(itemStatus), uint(Nostos.ItemStatus.Returned));
        
        (, Nostos.ClaimStatus claimStatus, , , , ) = nostos.getClaim(ITEM_ID_1, 0);
        assertEq(uint(claimStatus), uint(Nostos.ClaimStatus.Completed));
    }
    
    function testEmergencyResolveInComplexScenario() public {
        // Create complex scenario with multiple items and claims
        registerTestItem(ITEM_ID_1, user1);
        registerTestItem(ITEM_ID_2, user2);
        
        submitTestClaim(ITEM_ID_1, finder1);
        submitTestClaim(ITEM_ID_1, finder2);
        submitTestClaim(ITEM_ID_2, finder1);
        
        revealTestContactInfo(ITEM_ID_1, 0, user1, REWARD_AMOUNT);
        revealTestContactInfo(ITEM_ID_2, 0, user2, REWARD_AMOUNT);
        
        // Emergency resolve one claim
        vm.prank(feeRecipient);
        nostos.emergencyResolve(ITEM_ID_1, 1, payable(finder2), 0.05 ether);
        
        // Verify only the targeted claim was affected
        (, Nostos.ClaimStatus claimStatus0, , , , ) = nostos.getClaim(ITEM_ID_1, 0);
        assertEq(uint(claimStatus0), uint(Nostos.ClaimStatus.ContactRevealed));
        
        (, Nostos.ClaimStatus claimStatus1, , , , ) = nostos.getClaim(ITEM_ID_1, 1);
        assertEq(uint(claimStatus1), uint(Nostos.ClaimStatus.Disputed));
        
        (, Nostos.ClaimStatus claimStatus2, , , , ) = nostos.getClaim(ITEM_ID_2, 0);
        assertEq(uint(claimStatus2), uint(Nostos.ClaimStatus.ContactRevealed));
    }
}

/**
 * @notice Helper contract that rejects all payments for testing transfer failures
 */
contract RejectPayments {
    receive() external payable {
        revert("Payment rejected");
    }
    
    fallback() external payable {
        revert("Payment rejected");
    }
}