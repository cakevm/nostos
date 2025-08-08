// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Nostos.Base.t.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract NostosClaimsTest is NostosBaseTest {
    bytes constant encryptedContact = hex"456e637279707465642d436f6e74616374";
    
    function setUp() public override {
        super.setUp();
    }
    
    function test_SubmitClaim_Successful() public {
        registerTestItem(testItemId1, owner);
        
        vm.prank(finder);
        nostos.submitClaim(testItemId1, encryptedContact);
        
        assertEq(nostos.getClaimCount(testItemId1), 1);
        
        (address claimFinder, Nostos.ClaimStatus status,,,,) = nostos.getClaim(testItemId1, 0);
        assertEq(claimFinder, finder);
        assertEq(uint(status), uint(Nostos.ClaimStatus.Pending));
    }
    
    function test_SubmitClaim_MultipleFinders() public {
        registerTestItem(testItemId1, owner);
        
        vm.prank(finder);
        nostos.submitClaim(testItemId1, encryptedContact);
        
        vm.prank(user1);
        nostos.submitClaim(testItemId1, encryptedContact);
        
        vm.prank(user2);
        nostos.submitClaim(testItemId1, encryptedContact);
        
        assertEq(nostos.getClaimCount(testItemId1), 3);
    }
    
    function test_SubmitClaim_FailsOnNonExistentItem() public {
        vm.prank(finder);
        vm.expectRevert(Nostos.ItemNotFound.selector);
        nostos.submitClaim(testItemId1, encryptedContact);
    }
    
    function test_SubmitClaim_FailsOnReturnedItem() public {
        bytes32 itemId = testItemId1;
        registerTestItem(itemId, owner);
        uint256 claimIndex = submitTestClaim(itemId, finder);
        revealTestContactInfo(itemId, claimIndex, owner, 0.01 ether);
        vm.prank(owner);
        nostos.confirmReturn(itemId, claimIndex);
        
        vm.prank(user1);
        vm.expectRevert(Nostos.InvalidStatus.selector);
        nostos.submitClaim(itemId, encryptedContact);
    }
    
    function test_SubmitClaim_FailsWithEmptyContact() public {
        registerTestItem(testItemId1, owner);
        
        vm.prank(finder);
        vm.expectRevert(Nostos.EmptyData.selector);
        nostos.submitClaim(testItemId1, "");
    }
    
    function test_RevealContactInfo_Successful() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        uint256 escrowAmount = 0.01 ether;
        vm.prank(owner);
        nostos.revealContactInfo{value: escrowAmount}(testItemId1, claimIndex);
        
        (,Nostos.ClaimStatus status,,,uint256 escrow,) = nostos.getClaim(testItemId1, claimIndex);
        assertEq(uint(status), uint(Nostos.ClaimStatus.ContactRevealed));
        assertEq(escrow, escrowAmount);
    }
    
    function test_RevealContactInfo_FailsWithZeroEscrow() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        vm.prank(owner);
        vm.expectRevert(Nostos.InsufficientEscrow.selector);
        nostos.revealContactInfo{value: 0}(testItemId1, claimIndex);
    }
    
    function test_RevealContactInfo_FailsByNonOwner() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        vm.prank(user1);
        vm.expectRevert(Nostos.NotItemOwner.selector);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claimIndex);
    }
    
    function test_RevealContactInfo_FailsAfterDeadline() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        fastForwardToTimeout(0);
        
        vm.prank(owner);
        vm.expectRevert(Nostos.ClaimExpired.selector);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claimIndex);
    }
    
    function test_RevealContactInfo_FailsOnInvalidClaimIndex() public {
        registerTestItem(testItemId1, owner);
        
        vm.prank(owner);
        vm.expectRevert(Nostos.ItemNotFound.selector);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, 999);
    }
    
    function test_RevealContactInfo_FailsOnAlreadyRevealed() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        revealTestContactInfo(testItemId1, claimIndex, owner, 0.01 ether);
        
        vm.prank(owner);
        vm.expectRevert(Nostos.InvalidStatus.selector);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claimIndex);
    }
    
    function test_MultipleContactReveals_DifferentClaims() public {
        registerTestItem(testItemId1, owner);
        
        uint256 claim1 = submitTestClaim(testItemId1, finder);
        uint256 claim2 = submitTestClaim(testItemId1, user1);
        uint256 claim3 = submitTestClaim(testItemId1, user2);
        
        revealTestContactInfo(testItemId1, claim1, owner, 0.01 ether);
        revealTestContactInfo(testItemId1, claim2, owner, 0.02 ether);
        
        (,Nostos.ClaimStatus status1,,,uint256 escrow1,) = nostos.getClaim(testItemId1, claim1);
        (,Nostos.ClaimStatus status2,,,uint256 escrow2,) = nostos.getClaim(testItemId1, claim2);
        (,Nostos.ClaimStatus status3,,,uint256 escrow3,) = nostos.getClaim(testItemId1, claim3);
        
        assertEq(uint(status1), uint(Nostos.ClaimStatus.ContactRevealed));
        assertEq(uint(status2), uint(Nostos.ClaimStatus.ContactRevealed));
        assertEq(uint(status3), uint(Nostos.ClaimStatus.Pending));
        
        assertEq(escrow1, 0.01 ether);
        assertEq(escrow2, 0.02 ether);
        assertEq(escrow3, 0);
    }
    
    function test_ClaimStatusTransitions() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        (,Nostos.ClaimStatus status1,,,,) = nostos.getClaim(testItemId1, claimIndex);
        assertEq(uint(status1), uint(Nostos.ClaimStatus.Pending));
        
        revealTestContactInfo(testItemId1, claimIndex, owner, 0.01 ether);
        (,Nostos.ClaimStatus status2,,,,) = nostos.getClaim(testItemId1, claimIndex);
        assertEq(uint(status2), uint(Nostos.ClaimStatus.ContactRevealed));
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, claimIndex);
        (,Nostos.ClaimStatus status3,,,,) = nostos.getClaim(testItemId1, claimIndex);
        assertEq(uint(status3), uint(Nostos.ClaimStatus.Completed));
    }
    
    function test_FinderClaimsTracking() public {
        registerTestItem(testItemId1, owner);
        registerTestItem(testItemId2, owner);
        registerTestItem(testItemId3, owner);
        
        vm.startPrank(finder);
        nostos.submitClaim(testItemId1, encryptedContact);
        nostos.submitClaim(testItemId2, encryptedContact);
        nostos.submitClaim(testItemId3, encryptedContact);
        vm.stopPrank();
        
        bytes32[] memory finderItems = nostos.getFinderClaims(finder);
        assertEq(finderItems.length, 3);
        assertEq(finderItems[0], testItemId1);
        assertEq(finderItems[1], testItemId2);
        assertEq(finderItems[2], testItemId3);
    }
    
    function test_GetFinderClaimIndex() public {
        registerTestItem(testItemId1, owner);
        
        submitTestClaim(testItemId1, user1);
        submitTestClaim(testItemId1, finder);
        submitTestClaim(testItemId1, user2);
        
        uint256 index = nostos.getFinderClaimIndex(testItemId1, finder);
        assertEq(index, 1);
        
        uint256 notFoundIndex = nostos.getFinderClaimIndex(testItemId1, admin);
        assertEq(notFoundIndex, type(uint256).max);
    }
    
    function test_SubmitClaim_EmitsCorrectEvent() public {
        registerTestItem(testItemId1, owner);
        
        vm.expectEmit(true, true, true, true);
        emit Nostos.ClaimSubmitted(testItemId1, finder, 0, block.timestamp, encryptedContact);
        
        vm.prank(finder);
        nostos.submitClaim(testItemId1, encryptedContact);
    }
    
    function test_RevealContactInfo_EmitsCorrectEvent() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        uint256 escrowAmount = 0.01 ether;
        
        vm.expectEmit(true, true, true, true);
        emit Nostos.ContactRevealed(testItemId1, owner, claimIndex, escrowAmount, block.timestamp);
        
        vm.prank(owner);
        nostos.revealContactInfo{value: escrowAmount}(testItemId1, claimIndex);
    }
    
    function test_ClaimSubmission_UpdatesItemStatus() public {
        registerTestItem(testItemId1, owner);
        
        (,Nostos.ItemStatus statusBefore,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(statusBefore), uint(Nostos.ItemStatus.Active));
        
        submitTestClaim(testItemId1, finder);
        
        (,Nostos.ItemStatus statusAfter,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(statusAfter), uint(Nostos.ItemStatus.HasClaims));
    }
    
    function test_ClaimSubmission_AtTimeoutBoundary() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        // Just before timeout - should succeed
        vm.warp(block.timestamp + 30 days - 1);
        
        vm.prank(owner);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claimIndex);
        
        // Submit a new claim and try after timeout
        uint256 claim2 = submitTestClaim(testItemId1, user1);
        
        vm.warp(block.timestamp + 30 days + 2);
        
        vm.prank(owner);
        vm.expectRevert(Nostos.ClaimExpired.selector);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claim2);
    }
    
    function test_SubmitClaim_FailsWhenPaused() public {
        registerTestItem(testItemId1, owner);
        
        vm.prank(feeRecipient);
        nostos.pause();
        
        vm.prank(finder);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        nostos.submitClaim(testItemId1, encryptedContact);
    }
    
    function test_RevealContactInfo_FailsWhenPaused() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        vm.prank(feeRecipient);
        nostos.pause();
        
        vm.prank(owner);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claimIndex);
    }
    
    function test_LargeEscrowAmount() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        uint256 largeEscrow = 100 ether;
        vm.deal(owner, largeEscrow);
        
        vm.prank(owner);
        nostos.revealContactInfo{value: largeEscrow}(testItemId1, claimIndex);
        
        (,,,, uint256 escrow,) = nostos.getClaim(testItemId1, claimIndex);
        assertEq(escrow, largeEscrow);
    }
    
    function testFuzz_SubmitClaim_RandomContactData(bytes memory randomContact) public {
        vm.assume(randomContact.length > 0 && randomContact.length < 10000);
        
        registerTestItem(testItemId1, owner);
        
        vm.prank(finder);
        nostos.submitClaim(testItemId1, randomContact);
        
        (,,,,,bytes memory storedContact) = nostos.getClaim(testItemId1, 0);
        assertEq(storedContact, randomContact);
    }
    
    function test_MultipleFinderScenario() public {
        registerTestItem(testItemId1, owner);
        
        address[10] memory finders;
        for(uint i = 0; i < 10; i++) {
            finders[i] = address(uint160(0x5000 + i));
            vm.deal(finders[i], 1 ether);
            
            vm.prank(finders[i]);
            nostos.submitClaim(testItemId1, encryptedContact);
        }
        
        assertEq(nostos.getClaimCount(testItemId1), 10);
        
        for(uint i = 0; i < 10; i++) {
            (address claimFinder,,,,,) = nostos.getClaim(testItemId1, i);
            assertEq(claimFinder, finders[i]);
        }
    }
    
    function test_GasOptimization_ClaimSubmission() public {
        registerTestItem(testItemId1, owner);
        
        uint256 gasBefore = gasleft();
        vm.prank(finder);
        nostos.submitClaim(testItemId1, encryptedContact);
        uint256 gasUsed = gasBefore - gasleft();
        
        assertTrue(gasUsed < 200000, "Claim submission uses too much gas");
    }
}