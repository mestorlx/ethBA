const Web3 = require('web3');
const createKeccakHash = require('keccak');
const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;
const NFT = artifacts.require('NFT');
const NFTStore = artifacts.require('NFTStore');

async function assertRevert(promise) {
    try {
        await promise;
        assert.fail('Expected revert not received');
    } catch (error) {
        const revertFound = error.message.search('revert') >= 0;
        assert(revertFound, `Expected "revert", got ${error} instead`);
    }
};


contract('NFTStore', function(accounts) {
    let owner = accounts[0];
    let notOwner = accounts[1];
    let defaultURI = "https://uri.test";
    let store;
    let nft;
    let somePreImage = "esta es la frase magica";
    let someHash = createKeccakHash('keccak256').update(somePreImage).digest('hex');

    beforeEach("setup contract before each test", async function () {
        nft = await NFT.new({ from: owner });
        let callData = encodeCall('initialize', ['address'], [owner]);
        await nft.sendTransaction({data: callData, from: owner});
        
        store = await NFTStore.new({ from: owner });
        callData = encodeCall('initialize', ['address', 'address'], [owner,nft.address]);
        await store.sendTransaction({data: callData, from: owner});
        
        let address = await store.address;
        await nft.transferOwnership(address);
    })
    
    it("Should make first account an owner", async function() {
        assert.equal(await store.owner(), owner, "The owner of the NFTStore is not accounts[0]")
        var address = await store.address;

        assert.equal(await nft.owner(), address, "The owner of the NFT is not NFTStore");
    });
    
   });
