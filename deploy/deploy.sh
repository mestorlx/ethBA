#! /usr/bin/env bash

# Enable command logging.
set -x
NETWORK='local'
# run ganache-cli --port 8545 --deterministic
# Copy account 0 here
OWNER='0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'


# -----------------------------------------------------------------------
# Project setup and first implementation of an upgradeable Basil.sol
# -----------------------------------------------------------------------

# Clean up zos.* files
rm -f zos.json
rm -f zos.$NETWORK.json

# Compile all contracts.
rm -rf build && npx truffle compile

# Initialize project
# NOTE: Creates a zos.json file that keeps track of the project's details
zos init ethba 0.1.alpha -v

# Register Basil.sol in the project as an upgradeable contract.
zos add NFT -v
zos add NFTStore -v
# Deploy all implementations in the specified network.
# NOTE: Creates another zos.<network_name>.json file, specific to the network used, which keeps track of deployed addresses, etc.
zos push --from $OWNER --network $NETWORK --skip-compile -v

# Request a proxy for the upgradeably NFTSore.sol NFT.sol
# NOTE: A dapp could now use the address of the proxy specified in zos.<network_name>.json
nft=$(zos create NFT --from $OWNER --args $OWNER --network $NETWORK -v)
zos create NFTStore --from $OWNER --args $OWNER,$nft --network $NETWORK -v

#Copy JSON abis to web environment
if [ $# -eq 0 ]; then
    echo "No folder provided. ABIs will not be copied"
    exit 1
    else
        cp build/contracts/NFT.json $1/
        cp build/contracts/NFTStore.json $1/
        cp zos.local.json $1/
fi
# Disable command logging
set +x