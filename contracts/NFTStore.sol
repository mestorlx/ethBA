pragma solidity ^0.4.18;


import "zos-lib/contracts/migrations/Migratable.sol";
import "openzeppelin-zos/contracts/ownership/Ownable.sol";
import "./NFT.sol";

/**
 * @title Store and Grant Event Collectibles
 * Store Custom ERC721 crypto collectibles and grant ownership to anyone that
 * can provide the pre-image of a hash.
 */
contract NFTStore is Migratable, Ownable {
    // collectibles
    NFT public nft_;
    // Store hash to validate preImages quantity
    mapping (bytes32 => uint256) public quantities_;
    // Store hash with uris
    mapping (bytes32 => string) public uris_;

    /**
     * @dev Constructor function
     * @ param _nft Contract address for the collectibles contract
     */
    function initialize(address _owner, NFT _nft) isInitializer("NFTStore","0") public {
        Ownable.initialize(_owner);
        require(_nft != address(0));
        nft_ = _nft;
    }

    /**
     * @dev Add challenge (hash) to internal array and use default image
     * @param _hash sha3 hash
     */
    function addCollectible(bytes32 _hash, string _uri, uint256 _quantity) public {
        require(quantities_[_hash] == 0, "Collectible name is already used");
        quantities_[_hash] = _quantity;
        uris_[_hash] = _uri;
        //nft_.mint(owner, _uri, _quantity);
    }

    function collectiblesPendingToClaim(bytes32 _hash) view returns (uint256) {
        return quantities_[_hash];
    }
    
    function claimCollectible(address _to, string _preImage) public {
        bytes32 hash = keccak256(_preImage);
        /// First we get the hash of the pre image
        if(quantities_[hash] > 0){
            nft_.mint(_to, uris_[hash], 1);
            quantities_[hash] -= 1;
        }
    }
}