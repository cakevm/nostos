// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Nostos.sol";

contract DeployScript is Script {
    function run() external {
        // Load environment variables
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcast
        vm.startBroadcast(deployerKey);
        
        // Deploy contract
        Nostos nostos = new Nostos(feeRecipient);
        
        // Log deployment info
        console.log("===============================");
        console.log("Nostos Deployment Successful!");
        console.log("===============================");
        console.log("Contract Address:", address(nostos));
        console.log("Chain ID:", block.chainid);
        console.log("Fee Recipient:", feeRecipient);
        console.log("Registration Fee:", nostos.getRegistrationFee());
        console.log("Deployer:", vm.addr(deployerKey));
        console.log("===============================");
        
        vm.stopBroadcast();
    }
}