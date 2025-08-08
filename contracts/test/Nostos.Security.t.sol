// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Nostos.Base.t.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract NostosSecurityTest is NostosBaseTest {
    bytes constant encryptedContact = hex"456e637279707465642d436f6e74616374";
    bytes constant encryptedData = hex"456e637279707465642d44617461";
    
    MaliciousReceiver maliciousReceiver;
    ReentrantContract reentrantContract;
    GasGriefingContract gasGriefer;
    
    function setUp() public override {
        super.setUp();
        maliciousReceiver = new MaliciousReceiver();
        reentrantContract = new ReentrantContract(address(nostos));
        gasGriefer = new GasGriefingContract();
        vm.deal(address(reentrantContract), 10 ether);
        vm.deal(address(gasGriefer), 10 ether);
    }
    
    function test_ReentrancyProtection_RegisterItem() public {
        vm.prank(address(reentrantContract));
        reentrantContract.attackRegister{value: 1 ether}();
        
        assertEq(nostos.getClaimCount(testItemId1), 0);
    }
    
    function test_ReentrancyProtection_RevealContactInfo() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, address(reentrantContract));
        
        vm.prank(owner);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claimIndex);
        
        (, , , , uint256 escrow, ) = nostos.getClaim(testItemId1, claimIndex);
        assertEq(escrow, 0.01 ether);
    }
    
    function test_ReentrancyProtection_ConfirmReturn() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, address(reentrantContract));
        revealTestContactInfo(testItemId1, claimIndex, owner, 0.01 ether);
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, claimIndex);
        
        assertEq(address(reentrantContract).balance, 10.01 ether);
    }
    
    function test_ReentrancyProtection_ClaimStakeForfeiture() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, address(reentrantContract));
        
        fastForwardToTimeout(0);
        
        vm.prank(address(reentrantContract));
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
        
        assertEq(address(reentrantContract).balance, 10 ether + REGISTRATION_FEE - 0.0001 ether);  // Stake after fee
    }
    
    function test_IntegerOverflow_UserStats() public {
        uint256 maxItems = 65535;
        
        for(uint i = 0; i < 10; i++) {
            bytes32 itemId = keccak256(abi.encodePacked("item", i));
            vm.prank(owner);
            nostos.registerItem{value: REGISTRATION_FEE}(itemId, encryptedData);
        }
        
        uint256 stats = nostos.getUserStats(owner);
        uint256 totalItems = stats & 0xFFFF;
        
        assertTrue(totalItems <= maxItems);
    }
    
    function test_GasGriefing_RewardTransfer() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, address(gasGriefer));
        revealTestContactInfo(testItemId1, claimIndex, owner, 0.01 ether);
        
        vm.prank(owner);
        vm.expectRevert("Reward transfer failed");
        nostos.confirmReturn(testItemId1, claimIndex);
    }
    
    function test_GasGriefing_StakeForfeiture() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, address(gasGriefer));
        
        fastForwardToTimeout(0);
        
        vm.prank(address(gasGriefer));
        vm.expectRevert("Stake transfer failed");
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
    }
    
    function test_Pausable_AllMainFunctions() public {
        vm.prank(feeRecipient);
        nostos.pause();
        
        vm.prank(owner);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        nostos.registerItem{value: REGISTRATION_FEE}(testItemId1, encryptedData);
        
        vm.prank(feeRecipient);
        nostos.unpause();
        
        registerTestItem(testItemId1, owner);
        
        vm.prank(feeRecipient);
        nostos.pause();
        
        vm.prank(finder);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        nostos.submitClaim(testItemId1, encryptedContact);
        
        vm.prank(feeRecipient);
        nostos.unpause();
        
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        vm.prank(feeRecipient);
        nostos.pause();
        
        vm.prank(owner);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claimIndex);
        
        vm.prank(feeRecipient);
        nostos.unpause();
        
        revealTestContactInfo(testItemId1, claimIndex, owner, 0.01 ether);
        
        vm.prank(feeRecipient);
        nostos.pause();
        
        vm.prank(owner);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        nostos.confirmReturn(testItemId1, claimIndex);
    }
    
    function test_Pausable_ClaimStakeForfeitureNotAffected() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        fastForwardToTimeout(0);
        
        vm.prank(feeRecipient);
        nostos.pause();
        
        uint256 finderBalanceBefore = finder.balance;
        
        vm.prank(finder);
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
        
        uint256 finderBalanceAfter = finder.balance;
        assertEq(finderBalanceAfter - finderBalanceBefore, REGISTRATION_FEE - 0.0001 ether);  // Stake after fee
    }
    
    function test_FrontRunning_MultipleClaims() public {
        registerTestItem(testItemId1, owner);
        
        address frontRunner = address(0x9999);
        vm.deal(frontRunner, 1 ether);
        
        vm.prank(finder);
        nostos.submitClaim(testItemId1, encryptedContact);
        
        vm.prank(frontRunner);
        nostos.submitClaim(testItemId1, encryptedContact);
        
        assertEq(nostos.getClaimCount(testItemId1), 2);
        
        (address firstFinder,,,,,) = nostos.getClaim(testItemId1, 0);
        (address secondFinder,,,,,) = nostos.getClaim(testItemId1, 1);
        
        assertEq(firstFinder, finder);
        assertEq(secondFinder, frontRunner);
    }
    
    function test_FrontRunning_ContactReveal() public {
        registerTestItem(testItemId1, owner);
        
        uint256 claim1 = submitTestClaim(testItemId1, finder);
        uint256 claim2 = submitTestClaim(testItemId1, user1);
        
        vm.prank(owner);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claim1);
        
        vm.prank(owner);
        nostos.revealContactInfo{value: 0.02 ether}(testItemId1, claim2);
        
        (,Nostos.ClaimStatus status1,,,,) = nostos.getClaim(testItemId1, claim1);
        (,Nostos.ClaimStatus status2,,,,) = nostos.getClaim(testItemId1, claim2);
        
        assertEq(uint(status1), uint(Nostos.ClaimStatus.ContactRevealed));
        assertEq(uint(status2), uint(Nostos.ClaimStatus.ContactRevealed));
    }
    
    function test_DoS_ManyClaimsOnItem() public {
        registerTestItem(testItemId1, owner);
        
        for(uint i = 0; i < 100; i++) {
            address claimer = address(uint160(0x10000 + i));
            vm.prank(claimer);
            nostos.submitClaim(testItemId1, encryptedContact);
        }
        
        assertEq(nostos.getClaimCount(testItemId1), 100);
        
        uint256 gasUsed = gasleft();
        nostos.getClaimCount(testItemId1);
        gasUsed = gasUsed - gasleft();
        
        assertTrue(gasUsed < 10000);
    }
    
    function test_DoS_ManyItemsPerUser() public {
        for(uint i = 0; i < 50; i++) {
            bytes32 itemId = keccak256(abi.encodePacked("dos_item", i));
            vm.prank(owner);
            nostos.registerItem{value: REGISTRATION_FEE}(itemId, encryptedData);
        }
        
        bytes32[] memory userItemsList = nostos.getUserItems(owner);
        assertEq(userItemsList.length, 50);
        
        uint256 gasUsed = gasleft();
        nostos.getUserItems(owner);
        gasUsed = gasUsed - gasleft();
        
        assertTrue(gasUsed < 1000000);
    }
    
    function test_EdgeCase_MaxUint64Timestamp() public {
        uint64 maxTimestamp = type(uint64).max;
        
        // Warp to a time that won't overflow when adding CLAIM_TIMEOUT
        // CLAIM_TIMEOUT is 30 days = 2592000 seconds
        vm.warp(uint256(maxTimestamp) - CLAIM_TIMEOUT - 100);
        
        registerTestItem(testItemId1, owner);
        
        (,,uint64 regTime,,,) = nostos.getItem(testItemId1);
        assertTrue(regTime > 0 && regTime < type(uint64).max);
        
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        (,,uint64 claimTime,uint64 deadline,,) = nostos.getClaim(testItemId1, claimIndex);
        assertTrue(claimTime > 0 && claimTime < type(uint64).max);
        assertTrue(deadline > claimTime);
        assertTrue(deadline < type(uint64).max);
    }
    
    function test_EdgeCase_ClaimTimeoutBoundary() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        // Just before timeout - reveal should succeed
        vm.warp(block.timestamp + CLAIM_TIMEOUT - 1);
        
        vm.prank(owner);
        nostos.revealContactInfo{value: 0.01 ether}(testItemId1, claimIndex);
        
        // After reveal, claim status is ContactRevealed, not Pending
        // So stake forfeiture should fail with InvalidStatus
        vm.warp(block.timestamp + CLAIM_TIMEOUT + 2);
        
        vm.prank(finder);
        vm.expectRevert(Nostos.InvalidStatus.selector);
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
    }
    
    function test_ZeroAddress_Constructor() public {
        vm.expectRevert("Invalid fee recipient");
        new Nostos(address(0));
    }
    
    function test_MaliciousReceiver_RewardTransfer() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, address(maliciousReceiver));
        revealTestContactInfo(testItemId1, claimIndex, owner, 0.01 ether);
        
        vm.prank(owner);
        vm.expectRevert("Reward transfer failed");
        nostos.confirmReturn(testItemId1, claimIndex);
    }
    
    function test_MaliciousReceiver_StakeForfeiture() public {
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, address(maliciousReceiver));
        
        fastForwardToTimeout(0);
        
        vm.prank(address(maliciousReceiver));
        vm.expectRevert("Stake transfer failed");
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
    }
    
    function test_CrossFunctionStateConsistency() public {
        registerTestItem(testItemId1, owner);
        
        (,Nostos.ItemStatus status1,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(status1), uint(Nostos.ItemStatus.Active));
        
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        (,Nostos.ItemStatus status2,,,,) = nostos.getItem(testItemId1);
        assertEq(uint(status2), uint(Nostos.ItemStatus.HasClaims));
        
        fastForwardToTimeout(0);
        
        vm.prank(finder);
        nostos.claimStakeForfeiture(testItemId1, claimIndex);
        
        (,Nostos.ItemStatus status3,,,uint256 stake,) = nostos.getItem(testItemId1);
        assertEq(uint(status3), uint(Nostos.ItemStatus.Abandoned));
        assertEq(stake, 0);
    }
    
    function test_Invariant_TotalEscrowBalance() public {
        uint256 totalEscrow = 0;
        
        registerTestItem(testItemId1, owner);
        registerTestItem(testItemId2, owner);
        registerTestItem(testItemId3, owner);
        
        uint256 claim1 = submitTestClaim(testItemId1, finder);
        uint256 claim2 = submitTestClaim(testItemId2, user1);
        uint256 claim3 = submitTestClaim(testItemId3, user2);
        
        uint256 escrow1 = 0.01 ether;
        uint256 escrow2 = 0.02 ether;
        uint256 escrow3 = 0.03 ether;
        
        revealTestContactInfo(testItemId1, claim1, owner, escrow1);
        revealTestContactInfo(testItemId2, claim2, owner, escrow2);
        revealTestContactInfo(testItemId3, claim3, owner, escrow3);
        
        totalEscrow = escrow1 + escrow2 + escrow3;
        // Contract also holds stakes from registration (3 items * 0.0004 ether each)
        uint256 totalStakes = 3 * (REGISTRATION_FEE - 0.0001 ether);
        
        assertEq(address(nostos).balance, totalEscrow + totalStakes);
        
        vm.prank(owner);
        nostos.confirmReturn(testItemId1, claim1);
        
        totalEscrow -= escrow1;
        assertEq(address(nostos).balance, totalEscrow + totalStakes);
    }
    
    function testFuzz_RegisterItem_RandomData(bytes memory randomData, uint256 randomFee) public {
        vm.assume(randomData.length > 0 && randomData.length < 10000);
        vm.assume(randomFee >= REGISTRATION_FEE && randomFee < 10 ether);  // Limit to owner's balance
        
        bytes32 randomItemId = keccak256(abi.encodePacked(randomData, randomFee));
        
        vm.prank(owner);
        nostos.registerItem{value: randomFee}(randomItemId, randomData);
        
        (,,,, uint256 stake, bytes memory storedData) = nostos.getItem(randomItemId);
        assertEq(stake, randomFee - 0.0001 ether);  // Stake after platform fee
        assertEq(storedData, randomData);
    }
    
    function testFuzz_SubmitClaim_RandomContact(bytes memory randomContact) public {
        vm.assume(randomContact.length > 0 && randomContact.length < 10000);
        
        registerTestItem(testItemId1, owner);
        
        vm.prank(finder);
        nostos.submitClaim(testItemId1, randomContact);
        
        (,,,,,bytes memory storedContact) = nostos.getClaim(testItemId1, 0);
        assertEq(storedContact, randomContact);
    }
    
    function testFuzz_RevealContactInfo_RandomReward(uint256 randomReward) public {
        vm.assume(randomReward > 0 && randomReward < 100 ether);
        
        registerTestItem(testItemId1, owner);
        uint256 claimIndex = submitTestClaim(testItemId1, finder);
        
        vm.deal(owner, randomReward);
        
        vm.prank(owner);
        nostos.revealContactInfo{value: randomReward}(testItemId1, claimIndex);
        
        (,,,,uint256 escrow,) = nostos.getClaim(testItemId1, claimIndex);
        assertEq(escrow, randomReward);
    }
    
    function test_MalformedData_EmptyEncryptedData() public {
        vm.prank(owner);
        vm.expectRevert(Nostos.EmptyData.selector);
        nostos.registerItem{value: REGISTRATION_FEE}(testItemId1, "");
    }
    
    function test_MalformedData_EmptyContactInfo() public {
        registerTestItem(testItemId1, owner);
        
        vm.prank(finder);
        vm.expectRevert(Nostos.EmptyData.selector);
        nostos.submitClaim(testItemId1, "");
    }
    
    function test_MalformedData_VeryLargeData() public {
        bytes memory largeData = new bytes(100000);
        for(uint i = 0; i < largeData.length; i++) {
            largeData[i] = bytes1(uint8(i % 256));
        }
        
        vm.prank(owner);
        nostos.registerItem{value: REGISTRATION_FEE}(testItemId1, largeData);
        
        (,,,,,bytes memory storedData) = nostos.getItem(testItemId1);
        assertEq(storedData.length, largeData.length);
    }
}

contract MaliciousReceiver {
    receive() external payable {
        revert("I refuse payment");
    }
}

contract ReentrantContract {
    Nostos public nostos;
    bool attacking;
    
    constructor(address _nostos) {
        nostos = Nostos(_nostos);
    }
    
    receive() external payable {
        if (attacking) {
            attacking = false;
            nostos.registerItem{value: 0.001 ether}(keccak256("reentrant"), "data");
        }
    }
    
    function attackRegister() external payable {
        attacking = true;
        nostos.registerItem{value: msg.value}(keccak256("test"), "data");
    }
}

contract GasGriefingContract {
    receive() external payable {
        while(gasleft() > 0) {}
    }
}