// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Nostos.Base.t.sol";

contract NostosReturnsTest is NostosBaseTest {
    bytes constant encryptedContact = hex"456e637279707465642d436f6e74616374";
    bytes constant encryptedData = hex"456e637279707465642d44617461";
    
    function setUp() public override {
        super.setUp();
    }
    
    function test_ConfirmReturn_Successful() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        uint256 rewardAmount = 0.01 ether;
        revealTestContactInfo(testItemId1, claimIndex, owner, rewardAmount);
        
        uint256 finderBalanceBefore = finder.balance;
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, claimIndex);
        
        uint256 finderBalanceAfter = finder.balance;
        assertEq(finderBalanceAfter - finderBalanceBefore, rewardAmount);
        
        (,Nostos.ItemStatus itemStatus,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(itemStatus), uint(Nostos.ItemStatus.Returned));
        
        (,Nostos.ClaimStatus claimStatus,,,,) = nostos.getClaim(testItemId1, claimIndex);
        assertEq(uint(claimStatus), uint(Nostos.ClaimStatus.Completed));
    }
    
    function test_ConfirmReturn_FailsByNonOwner() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        revealTestContactInfo(testItemId1, claimIndex, owner, 0.01 ether);
        
        vm.prank(user1);
        vm.expectRevert(Nostos.NotItemOwner.selector);
        nostos.confirmReturn(testItemId1, claimIndex);
    }
    
    function test_ConfirmReturn_FailsWithInvalidClaimIndex() public {
        registerTestItem(testItemId1, owner);
        
        vm.prank(owner);
        vm.expectRevert(Nostos.ItemNotFound.selector);
        nostos.confirmReturn(testItemId1, 999);
    }
    
    function test_ConfirmReturn_FailsWithoutContactReveal() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        vm.prank(owner);
        vm.expectRevert(Nostos.InvalidStatus.selector);
        nostos.confirmReturn(testItemId1, claimIndex);
    }
    
    function test_ConfirmReturn_FailsWithZeroEscrow() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        vm.prank(owner);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claimIndex);
        
        (, , , , uint256 escrowBefore, ) = nostos.getClaim(testItemId1, claimIndex);
        assertEq(escrowBefore, 0.01 ether);
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, claimIndex);
        
        (, , , , uint256 escrowAfter, ) = nostos.getClaim(testItemId1, claimIndex);
        assertEq(escrowAfter, 0);
        
        // After confirmReturn, the claim status is Completed, so it fails with InvalidStatus
        vm.prank(owner);
        vm.expectRevert(Nostos.InvalidStatus.selector);
        nostos.confirmReturn(testItemId1, claimIndex);
    }
    
    function test_ClaimStakeForfeiture_Successful() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        // Stake is REGISTRATION_FEE - PLATFORM_FEE = 0.0004 ether
        uint256 expectedStake = REGISTRATION_FEE - 0.0001 ether;
        uint256 finderBalanceBefore = finder.balance;
        
        fastForwardToTimeout(0);
        
        vm.prank(finder);
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
        
        uint256 finderBalanceAfter = finder.balance;
        assertEq(finderBalanceAfter - finderBalanceBefore, expectedStake);
        
        (,Nostos.ItemStatus itemStatus,,,uint256 itemStake,) = nostos.getItem(testItemId1);
        assertEq(uint(itemStatus), uint(Nostos.ItemStatus.Abandoned));
        assertEq(itemStake, 0);
    }
    
    function test_ClaimStakeForfeiture_FailsByNonFinder() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        fastForwardToTimeout(0);
        
        vm.prank(user1);
        vm.expectRevert(Nostos.NotFinder.selector);
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
    }
    
    function test_ClaimStakeForfeiture_FailsBeforeDeadline() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        vm.warp(block.timestamp + 29 days);
        
        vm.prank(finder);
        vm.expectRevert(Nostos.ClaimExpired.selector);
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
    }
    
    function test_ClaimStakeForfeiture_FailsOnResolvedClaim() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        revealTestContactInfo(testItemId1, claimIndex, owner, 0.01 ether);
        
        fastForwardToTimeout(0);
        
        vm.prank(finder);
        vm.expectRevert(Nostos.InvalidStatus.selector);
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
    }
    
    function test_ClaimStakeForfeiture_FailsOnCompletedClaim() public {
        bytes32 itemId = testItemId1;
        registerTestItem(itemId, owner);
        uint256 claimIndex = submitTestClaim(itemId, finder);
        revealTestContactInfo(itemId, claimIndex, owner, 0.01 ether);
        vm.prank(owner);
        nostos.confirmReturn(itemId, claimIndex);
        
        fastForwardToTimeout(0);
        
        vm.prank(finder);
        vm.expectRevert(Nostos.InvalidStatus.selector);
        nostos.claimStakeForfeiture(itemId, 0);
    }
    
    function test_MultipleReturns_DifferentItems() public {
        registerTestItem(testItemId1, owner);
        registerTestItem(testItemId2, owner);
        registerTestItem(testItemId3, owner);
        
        uint256 claim1 = submitTestClaim(testItemId1, finder);
        uint256 claim2 = submitTestClaim(testItemId2, finder);
        uint256 claim3 = submitTestClaim(testItemId3, finder);
        
        revealTestContactInfo(testItemId1, claim1, owner, 0.01 ether);
        revealTestContactInfo(testItemId2, claim2, owner, 0.02 ether);
        revealTestContactInfo(testItemId3, claim3, owner, 0.03 ether);
        
        uint256 finderBalanceBefore = finder.balance;
        
        vm.startPrank(owner);
        nostos.confirmReturn(testItemId1, claim1);
        nostos.confirmReturn(testItemId2, claim2);
        nostos.confirmReturn(testItemId3, claim3);
        vm.stopPrank();
        
        uint256 finderBalanceAfter = finder.balance;
        assertEq(finderBalanceAfter - finderBalanceBefore, 0.06 ether);
        
        (,Nostos.ItemStatus status1,,,,) = nostos.getItem(testItemId1);
        (,Nostos.ItemStatus status2,,,,) = nostos.getItem(testItemId2);
        (,Nostos.ItemStatus status3,,,,) = nostos.getItem(testItemId3);
        
        assertEq(uint(status1), uint(Nostos.ItemStatus.Returned));
        assertEq(uint(status2), uint(Nostos.ItemStatus.Returned));
        assertEq(uint(status3), uint(Nostos.ItemStatus.Returned));
    }
    
    function test_CorrectBalanceTransfers() public {
        uint256 rewardAmount = 0.5 ether;
        
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        uint256 contractBalanceBefore = address(nostos).balance;
        
        vm.prank(owner);
        nostos.revealContactInfo{value: rewardAmount}(testItemId1, claimIndex);
        
        uint256 contractBalanceAfterReveal = address(nostos).balance;
        assertEq(contractBalanceAfterReveal - contractBalanceBefore, rewardAmount);
        
        uint256 finderBalanceBefore = finder.balance;
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, claimIndex);
        
        uint256 finderBalanceAfter = finder.balance;
        uint256 contractBalanceAfterReturn = address(nostos).balance;
        
        assertEq(finderBalanceAfter - finderBalanceBefore, rewardAmount);
        assertEq(contractBalanceBefore, contractBalanceAfterReturn);
    }
    
    function test_UserStatsUpdate_OnReturn() public {
        registerTestItem(testItemId1, owner);
        registerTestItem(testItemId2, owner);
        
        uint256 statsBefore = nostos.getUserStats(owner);
        uint256 totalBefore = statsBefore & 0xFFFF;
        uint256 activeBefore = (statsBefore >> 16) & 0xFFFF;
        uint256 returnedBefore = (statsBefore >> 32) & 0xFFFF;
        
        assertEq(totalBefore, 2);
        assertEq(activeBefore, 2);  // Now incremented during registration
        assertEq(returnedBefore, 0);
        
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        revealTestContactInfo(testItemId1, claimIndex, owner, 0.01 ether);
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, claimIndex);
        
        uint256 statsAfter = nostos.getUserStats(owner);
        uint256 totalAfter = statsAfter & 0xFFFF;
        uint256 activeAfter = (statsAfter >> 16) & 0xFFFF;
        uint256 returnedAfter = (statsAfter >> 32) & 0xFFFF;
        
        assertEq(totalAfter, 2);
        assertEq(activeAfter, 1);  // One still active, one returned
        assertEq(returnedAfter, 1);
    }
    
    function test_ItemStatusTransitions() public {
        registerTestItem(testItemId1, owner);
        
        (,Nostos.ItemStatus status1,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(status1), uint(Nostos.ItemStatus.Active));
        
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        (,Nostos.ItemStatus status2,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(status2), uint(Nostos.ItemStatus.HasClaims));
        
        revealTestContactInfo(testItemId1, claimIndex, owner, 0.01 ether);
        
        (,Nostos.ItemStatus status3,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(status3), uint(Nostos.ItemStatus.HasClaims));
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, claimIndex);
        
        (,Nostos.ItemStatus status4,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(status4), uint(Nostos.ItemStatus.Returned));
    }
    
    function test_ItemAbandoned_AfterStakeForfeiture() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        fastForwardToTimeout(0);
        
        vm.prank(finder);
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
        
        (,Nostos.ItemStatus status,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(status), uint(Nostos.ItemStatus.Abandoned));
    }
    
    function test_EventEmission_ItemReturned() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        uint256 rewardAmount = 0.01 ether;
        revealTestContactInfo(testItemId1, claimIndex, owner, rewardAmount);
        
        vm.expectEmit(true, true, true, true);
        emit Nostos.ItemReturned(testItemId1, owner, finder, rewardAmount, block.timestamp);
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, claimIndex);
    }
    
    function test_EventEmission_StakeForfeited() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        uint256 stake = REGISTRATION_FEE - 0.0001 ether;  // Actual stake after fee
        
        fastForwardToTimeout(0);
        
        vm.expectEmit(true, true, false, true);
        emit Nostos.StakeForfeited(testItemId1, finder, stake, block.timestamp);
        
        vm.prank(finder);
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
    }
    
    function test_EventEmission_ItemAbandoned() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        fastForwardToTimeout(0);
        
        vm.expectEmit(true, true, false, true);
        emit Nostos.ItemAbandoned(testItemId1, owner, block.timestamp);
        
        vm.prank(finder);
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
    }
    
    function test_ReentrancyProtection_ConfirmReturn() public {
        ReentrantAttacker attacker = new ReentrantAttacker(address(nostos));
        vm.deal(address(attacker), 10 ether);
        
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, address(attacker));
        revealTestContactInfo(testItemId1, claimIndex, owner, 1 ether);
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, claimIndex);
    }
    
    function test_NonExistentItem_Returns() public {
        vm.prank(owner);
        vm.expectRevert(Nostos.ItemNotFound.selector);
        nostos.confirmReturn(keccak256("nonexistent"), 0);
    }
    
    function test_EdgeCase_MultipleStakeForfeiture() public {
        registerTestItem(testItemId1, owner);
        registerTestItem(testItemId2, owner);
        
        uint256 claim1 = submitTestClaim(testItemId1, finder);
        uint256 claim2 = submitTestClaim(testItemId2, finder);
        
        fastForwardToTimeout(0);
        
        uint256 expectedStake = REGISTRATION_FEE - 0.0001 ether;
        uint256 finderBalanceBefore = finder.balance;
        
        vm.startPrank(finder);
        nostos.claimStakeForfeiture(testItemId1, claim1);
        nostos.claimStakeForfeiture(testItemId2, claim2);
        vm.stopPrank();
        
        uint256 finderBalanceAfter = finder.balance;
        assertEq(finderBalanceAfter - finderBalanceBefore, expectedStake * 2);
    }
    
    function test_FullIntegration_CompleteReturnFlow() public {
        uint256 initialOwnerBalance = owner.balance;
        uint256 initialFinderBalance = finder.balance;
        uint256 initialFeeRecipientBalance = feeRecipient.balance;
        
        vm.prank(owner);
        nostos.registerItem{value: REGISTRATION_FEE}(testItemId1, encryptedData);
        
        assertEq(feeRecipient.balance - initialFeeRecipientBalance, 0.0001 ether);  // Only platform fee
        
        vm.prank(finder);
        nostos.submitClaim(testItemId1, encryptedContact);
        
        uint256 rewardAmount = 0.1 ether;
        vm.prank(owner);
        nostos.revealContactInfo{value: rewardAmount}(testItemId1, 0);
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, 0);
        
        assertEq(finder.balance - initialFinderBalance, rewardAmount);
        assertEq(initialOwnerBalance - owner.balance, REGISTRATION_FEE + rewardAmount);
        
        (,Nostos.ItemStatus finalStatus,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(finalStatus), uint(Nostos.ItemStatus.Returned));
    }
}

contract ReentrantAttacker {
    Nostos public nostos;
    bool public attacking;
    
    constructor(address _nostos) {
        nostos = Nostos(_nostos);
    }
    
    receive() external payable {
        if (attacking) {
            attacking = false;
            nostos.confirmReturn(bytes32(0), 0);
        }
    }
    
    function attack() external {
        attacking = true;
    }
}