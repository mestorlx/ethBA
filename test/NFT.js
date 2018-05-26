const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;
const NFT = artifacts.require('NFT');

async function assertRevert(promise) {
    try {
        await promise;
        assert.fail('Expected revert not received');
    } catch (error) {
        const revertFound = error.message.search('revert') >= 0;
        assert(revertFound, `Expected "revert", got ${error} instead`);
    }
};

contract('NFT', function(accounts) {
    let owner = accounts[0];
    let notOwner = accounts[1];
    let nft;

    beforeEach('setup contract before each test', async function () {
        nft = await NFT.new({ from: owner });
        const callData = encodeCall('initialize', ['address'], [owner]);
        await nft.sendTransaction({data: callData, from: owner});
    });
    
    it("First account should be owner", async function() {
        let contractOwner = await nft.owner();
        
        assert.equal(contractOwner, owner, "The owner of the contract is not accounts[0]");
    });
    
    it("Should have name, symbol and  0 balance", async function() {
        let balance = await nft.totalSupply();
        const name = await nft.name();
        const symbol = await nft.symbol();

        assert.equal(name, "Natalia-Natalia", "Wrong token name");
        assert.equal(symbol, "NN", "Wrong token symbol");
        assert.equal(balance.valueOf(), 0, "Balance is not 0");

    });

    it("Owner should be able to mint", async function(){
        let qty = 10;
        await nft.mint(owner, "super awesome", qty);
        let balance = await nft.totalSupply();

        assert.equal(balance.valueOf(), qty, "The owner account does not have the minted collectible");
    });
    
    it("Others should not be able to mint", async () => {
        await nft.transferOwnership(notOwner);
        let contractOwner = await nft.owner();

        await assert.notEqual(contractOwner, owner);
        await assertRevert(nft.mint(owner, "not so awesome",1));
    });
    
    it("Index of coins should be correlated", async () => {
        let uriOne = "awesome one";
        let uriTwo = "awesome two";
        await nft.mint(accounts[0], uriOne, 1);
        await nft.mint(accounts[0], uriTwo, 1);

        assert.equal(await nft.tokenURI(0), uriOne);
        assert.equal(await nft.tokenURI(1), uriTwo);
    });
});
