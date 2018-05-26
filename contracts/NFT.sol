pragma solidity ^0.4.24;

import "zos-lib/contracts/migrations/Migratable.sol";
import "openzeppelin-zos/contracts/ownership/Ownable.sol";
import "openzeppelin-zos/contracts/token/ERC721/ERC721Token.sol";


/**
 * @title ERC721 Token to hold memories
 */
contract NFT is Migratable, Ownable, ERC721Token{
    /**
    
     */
    function initialize(address _owner) isInitializer("NFT","0") public {
        Ownable.initialize(_owner);
        ERC721Token.initialize("Natalia-Natalia", "NN");
    }

    /** 
     * @dev we set the uri on mint to prevent further changes
     * @param _to address the beneficiary that will own the minted collectible
     * @param _uri string URI conforming to EIP 1047: Token Metadata JSON Schema 
     * see (https://eips.ethereum.org/EIPS/eip-1047)
     */
    function mint(address _to, string _uri, uint256 _quantity) public onlyOwner{
        for (uint256 i = 0; i < _quantity; i++) {
            ERC721Token._mint(_to, ERC721Token.totalSupply());
            ERC721Token._setTokenURI((ERC721Token.totalSupply()-1), _uri);   
        }
    }
}
