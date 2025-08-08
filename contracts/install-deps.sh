#!/bin/bash
# Install Foundry dependencies as git submodules

echo "Installing Foundry dependencies..."

# Install forge-std
forge install foundry-rs/forge-std --no-commit

# Install OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit

echo "Dependencies installed successfully!"
echo "Run 'forge build' to compile contracts"