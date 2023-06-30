// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Rewards is ERC1155, AccessControl, ERC1155URIStorage {
    
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    using Counters for Counters.Counter;

    //struct to store listed tokens information
    struct ListedToken {
      uint256 tokenId;
      address issuer;
      bytes32 merkletRoot;
      bool claimable;
      address [] owners;
    }
    
    string private _name;
    string private _symbol;

    Counters.Counter private _tokenIds;
    bool public _blockAllIssuers;
    mapping(uint256 => ListedToken) private _listedTokens;
    mapping(uint256 => mapping(address => uint256)) private _ownersIndexes;

    event TokenCreated(uint256 tokenId,address issuer);
    event TokenClaim(uint256 tokenId,address recipient);
    event MerkleRootChange(uint256 tokenId,address modifiedBy);
    event SetUri(uint256 tokenId, string newUri);
    event UpdateIssuers(uint256 totalNew, uint256 totalRevoke);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseUri
    ) ERC1155 (baseUri) {
        _name = name_;
        _symbol = symbol_;
        _setBaseURI(baseUri);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    /**
     * @notice Get collection name
    */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @notice Get collection symbol
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @notice Get collection symbol
     */
    function getTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @notice Required overrride
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

     /**
     * @notice Set base uri for metadata (ERC1155URIStorage)
     */
    function _setBaseURI(string memory baseURI) internal override {
       super._setBaseURI(baseURI);
    }

     /**
     * @notice Set metadata uri for token id (ERC1155URIStorage)
     */
    function _setURI(uint256 tokenId, string memory tokenURI) internal override {
       super._setURI(tokenId,tokenURI);
       emit SetUri(tokenId, tokenURI);     
    }

    /**
     * @notice Get metadata url for token id (ERC1155URIStorage)
     */
    function uri(uint256 tokenId) public view override (ERC1155, ERC1155URIStorage) returns (string memory) {
        return super.uri(tokenId);
    }

    /**
     * @notice Change base uri for all tokens
     */
    function updateBaseURI(string memory baseURI) onlyRole(DEFAULT_ADMIN_ROLE) public  {
       super._setBaseURI(baseURI);
    }

    /**
     * @notice Update metadata uri for a token id
    */
    function updateTokenURI(uint256 tokenId, string memory tokenURI) onlyRole(ISSUER_ROLE) public {
        
        require(  _listedTokens[tokenId].issuer == msg.sender || 
                 hasRole(DEFAULT_ADMIN_ROLE, msg.sender) , "Action not allowed: updateTokenURI");

        _setURI(tokenId,tokenURI);
    }

    /**
     * @notice Update token issuers (EOAs with permission to create tokens)
    */
    function updateTokenIssuersBatch(address[] calldata toAdd,  address[] calldata  toRemove) onlyRole(DEFAULT_ADMIN_ROLE) external  {

        uint256 totalNew = 0;
        uint256 totalRevoke = 0;

        //add role to new issuers
        for(uint i=0; i < toAdd.length ; i++)
        {
            _grantRole(ISSUER_ROLE, toAdd[i]);
            totalNew += 1;
        }

        //remove role to existing issuers
        for(uint i=0; i < toRemove.length ; i++)
        {
            _revokeRole(ISSUER_ROLE, toRemove[i]);
            totalRevoke += 1;
        }

        emit UpdateIssuers(totalNew, totalRevoke);
    }

     /**
     * @notice Temporarily block/enable all authorized issuers from creating tokens
     */
    function blockTokensIssuing (bool newStatus) onlyRole(DEFAULT_ADMIN_ROLE) external  {
      _blockAllIssuers = newStatus;
    }

    /**
     * @notice Verify if token is mintable 
    */
    function isTokenMintable(uint256 tokenId) public view returns (bool){
        return _listedTokens[tokenId].claimable;
    }

    /**
     * @notice Temporarily block minting for a token
    */
    function blockTokenMint(uint256 tokenId, bool newStatus) onlyRole(ISSUER_ROLE) public {
        
        require(  _listedTokens[tokenId].issuer == msg.sender || 
                 hasRole(DEFAULT_ADMIN_ROLE, msg.sender) , "Action not allowed: blockTokenMint");

        _listedTokens[tokenId].claimable = newStatus;
    }

    /**
     * @notice Change merkle root hash for token id
     */
    function setMerkleRoot(uint256 tokenId,bytes32 merkleRootHash) onlyRole(ISSUER_ROLE) public {
        
        require(  _listedTokens[tokenId].issuer == msg.sender || 
                 hasRole(DEFAULT_ADMIN_ROLE, msg.sender) , "Action not allowed: set merkle root");

        _listedTokens[tokenId].merkletRoot = merkleRootHash;

        emit MerkleRootChange(tokenId, msg.sender);
    }

     /**
     * @notice Verify merkle proof of the address
     */
    function isAddressWhitelisted(uint256 tokenId, address addressToVerify, bytes32[] calldata merkleProof) private view returns (bool) {
       
       //use merkle trees to enforce whitelisting functionality
       ListedToken storage currentItem = _listedTokens[tokenId];
       require( currentItem.merkletRoot != 0, "No whitelist found for requested token");
       bytes32 merkleRoot = currentItem.merkletRoot;
       bytes32 leaf = keccak256(abi.encodePacked(addressToVerify));
       return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }
    
    /**
     * @notice List (create) a new a new token for this collection
    */
    function createToken(string memory tokenURI, bytes32 merkleRootHash) external onlyRole(ISSUER_ROLE) {
        
        require(_blockAllIssuers == false || hasRole(DEFAULT_ADMIN_ROLE, msg.sender) , "Cannot create tokens at this time.");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _setURI(newTokenId, tokenURI);
        _mint( address(this) , newTokenId , 1, "");

        ListedToken storage newListedToken = _listedTokens[newTokenId];
        newListedToken.tokenId = newTokenId;
        newListedToken.issuer = msg.sender;
        newListedToken.merkletRoot = merkleRootHash;
        newListedToken.claimable = true;

        emit TokenCreated(newTokenId, msg.sender);
    }

    /**
     * @notice Claim a token
     */
    function mint(address to, uint256 tokenId, bytes32[] calldata merkleProof ) external onlyRole(DEFAULT_ADMIN_ROLE)  {
        
        ListedToken storage listedTokenItem = _listedTokens[tokenId];

        require(listedTokenItem.issuer != address(0), "Invalid token id");
        require(_ownersIndexes[tokenId][to]  == 0, "Token already claimed by this wallet");
        require(listedTokenItem.claimable == true, "Token is not claimable at this moment");
        require( isAddressWhitelisted(tokenId, to ,merkleProof), "Address is not allowed to claim the requested token");

        _mint(to,tokenId, 1, "");

        listedTokenItem.owners.push(to);
        _ownersIndexes[tokenId][to] = listedTokenItem.owners.length;

        emit TokenClaim(tokenId, to);
    }

    /**
     * @notice Get all existing tokens
     */
    function getAllListedTokens() external view returns (ListedToken[] memory) {

        uint256 totalCount = _tokenIds.current();
        ListedToken[] memory responseData = new ListedToken[](totalCount);
        uint currentIndex = 0;

        for(uint i=0; i < totalCount; i++)
        {
            uint currentId = i + 1;
            ListedToken storage currentItem = _listedTokens[currentId];
            responseData[currentIndex] = currentItem;
            currentIndex += 1;
        }

        return responseData;
    }

    /**
     * @notice Get tokens claimed by a specific EOA
    */
    function getMyTokens() external view returns (ListedToken[] memory)  {
        
        uint256 totalCount = _tokenIds.current();
        uint myTotal = 0;

        for(uint i=0; i < totalCount; i++)
        {
            uint currentId = i + 1;
            
            if(_ownersIndexes[currentId][msg.sender] != 0){
               myTotal +=1;
            }
        }

        ListedToken[] memory responseData = new ListedToken[](myTotal);
        uint responseIndex = 0;

        for(uint i=0; i < totalCount; i++)
        {
            uint currentId = i + 1;
            
            if(_ownersIndexes[currentId][msg.sender] != 0){
                ListedToken storage currentItem = _listedTokens[currentId];
                responseData[responseIndex] = currentItem;
                responseIndex += 1;
            }
        }

        return responseData;
    }


}