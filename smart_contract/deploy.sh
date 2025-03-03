#!/bin/bash

# Load environment variables if needed
source ../.env

# Print the account we're using
echo "Using NEAR testnet account: $NEAR_TESTNET_ACCOUNT"

# Check if target directory exists
mkdir -p res

# Compile the contract
cargo build --target wasm32-unknown-unknown --release

# Copy the compiled contract to the res directory
cp target/wasm32-unknown-unknown/release/smart_contract.wasm ./res/

# Deploy sentiment contract
echo "Deploying the Smart Contract..."
near deploy --wasmFile ./res/smart_contract.wasm --accountId "$NEAR_TESTNET_ACCOUNT" --networkId testnet --force

echo "Deployment complete!" 