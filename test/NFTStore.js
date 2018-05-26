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
    let someURI = "https://uri.test";
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
    
    it("Anyone should be able to add memories", async () => {
        await store.transferOwnership(notOwner);
        let contractOwner = await store.owner();

        await assert.notEqual(contractOwner, owner);
        await store.addCollectible(web3.sha3(somePreImage), someURI, 1);
        let balance = await store.collectiblesPendingToClaim(web3.sha3(somePreImage));
        
        assert.equal(balance.valueOf(), 1, "The memory was not added");
    });
    
    it("When an invalid pre-image is provided collectible should not be minted ", async () => {
        let preImage = "esta NO es la frase magica";
        await store.addCollectible(web3.sha3(somePreImage), someURI, 1);
        await store.claimCollectible(owner, preImage);
        let balance = await nft.totalSupply();

        assert.equal(balance.valueOf(), 0, "The collectible was minted");
    });
    
    it("When a valid pre-image is provided collectible should be minted ", async () => {
        await store.addCollectible(web3.sha3(somePreImage), someURI, 1);
        await store.claimCollectible(owner, somePreImage);
        let balance = await nft.totalSupply();

        assert.equal(balance.valueOf(), 1, "The collectible was not properly minted");
        assert.equal(await nft.tokenURI(0), someURI);
        let memories = await store.collectiblesPendingToClaim(web3.sha3(somePreImage));

        assert.equal(memories.valueOf(), 0);
    });

    it("collectible should not be minted when supply 0", async () => {
        await store.addCollectible(web3.sha3(somePreImage), someURI, 1);
        await store.claimCollectible(owner, somePreImage);
        let balance = await nft.totalSupply();

        assert.equal(balance.valueOf(), 1, "The collectible was not properly minted");
    
        await store.claimCollectible(owner, somePreImage);
        balance = await nft.totalSupply();
        assert.equal(balance.valueOf(), 1, "Extra collectible was minted");
    });
    
    it("When multiple collectible are added anyone should be claimable", async () => {
        await store.addCollectible(web3.sha3(somePreImage), someURI, 1);
        await store.addCollectible(web3.sha3("this is not the collectible you are looking for"), "not the uri", 1);
    
        await store.claimCollectible(owner,somePreImage);
        balance = await nft.totalSupply();
        assert.equal(balance.valueOf(), 1, "The collectible was not properly minted");
        assert.equal(await nft.tokenURI(0), someURI);
    });
    
});
