require('dotenv').load();
var HDWalletProvider = require("truffle-hdwallet-provider");

// Add only when in use
var mnemonic = 
let infuraAPI = 

var provider_url = "https://ropsten.infura.io/"+infuraAPI;

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 8545,
      gas: 5000000,
      network_id: '*'
    },
    ropsten: { 
      network_id: 3, 
      gas: 4000000,  
      gasPrice: 50000000000,
      provider: () => new HDWalletProvider(mnemonic, provider_url)
    }
  }
};
