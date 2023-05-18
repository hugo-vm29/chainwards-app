const hre = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { MerkleTree } = require('merkletreejs')

const getMerkleRoot = (whitelist) => {

  const { keccak256 } = hre.ethers.utils;
  let leaves = whitelist.map((addr) => keccak256(addr))
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
  const merkleRootHash = merkleTree.getHexRoot();
  return merkleRootHash;
}

const getMerkleProof = (whitelist, address) => {

  const { keccak256 } = ethers.utils;
  let leaves = whitelist.map((addr) => keccak256(addr))
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
  let hashedAddress = keccak256(address);
  const proof = merkleTree.getHexProof(hashedAddress);
  return proof;
}

const deployContractHelper = async () => {

  const baseUrl = "https://ipfs.filebase.io/ipfs/";

  const contractFactory = await hre.ethers.getContractFactory('Rewards');
  const contractInstance = await contractFactory.deploy("Awesome Collection",'AW',baseUrl);

  await contractInstance.deployed();
  return { contractInstance };
}

async function main() {

  const { contractInstance } = await loadFixture(deployContractHelper);

  //const contractInstance =  await deployContractHelper();
  console.log(`Contract deployed to address: ${contractInstance.address}`);

  const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
  
  //console.log(`owner: ${owner.address}`);
  //console.log(`addr1: ${addr1.address}`);

  let whitelist = [addr2.address ,addr3.address ,addr4.address];
  const merkleRootHash = getMerkleRoot(whitelist);

  try{

    const metadataURI = "QmbBJmNBckg997V16T6zK7jbD7vG2GEtfZXEFRjcoQ7X4P";
    const txResponse = await contractInstance.createToken(metadataURI, merkleRootHash);
    const txReceipt = await txResponse.wait();
    console.log("1) Create token with ID 1 -> ", txReceipt.status);

  }catch(err){
    console.log("Error (case 1)", err?.message || "Error (case 1)");
  }

  try{

    const metadataURI = "QmbBJmNBckg997V16T6zK7jbD7vG2GEtfZXEFRjcoQ7X4P";
    const txResponse = await contractInstance.createToken(metadataURI, merkleRootHash);
    const txReceipt = await txResponse.wait();
    console.log("2) Create token with ID 2 -> ", txReceipt.status);

  }catch(err){
    console.log("Error (case 2)", err?.message || "Error (case 2)");
  }

  try{

    const toAddress = addr3.address;
    const proof = getMerkleProof(whitelist, toAddress);
    const txResponse = await contractInstance.mint(toAddress,1, proof);
    const txReceipt = await txResponse.wait();

    console.log("3) Claim token with ID 1 -> ", txReceipt.status);

  }catch(err){
    console.log("Error (case 3)", err?.message || "Error (case 3)");
  }
  
  try{

    const txResponse = await contractInstance.getAllListedTokens();
    console.log("4) Get all tokens -> ", txResponse);

  }catch(err){
    console.log("Error (case 4)", err?.message || "Error (case 4)");
  }

  
  try{

    const txResponse = await contractInstance.connect(addr3).getMyTokens();
    console.log("5) Get my tokens (addr3) -> ", txResponse);

  }catch(err){
    console.log("Error (case 5)", err?.message || "Error (case 5)");
  }
  
  try{

    const toAddress = addr5.address;
    let whitelistNew = [...whitelist, toAddress];
    const proof = getMerkleProof(whitelistNew, toAddress);
    const txResponse = await contractInstance.connect(owner).mint(toAddress,1, proof);
    const txReceipt = await txResponse.wait();

    console.log("6) Claim token with ID 2 with not authorized wallet -> ", txReceipt.status);

  }catch(err){
    console.log("Error (case 6) ✓", err?.message || "Error (case 6)");
  }

  try{

    const toAddress = addr3.address;
    const proof = getMerkleProof(whitelist, toAddress);
    const txResponse = await contractInstance.mint(toAddress,1, proof);
    const txReceipt = await txResponse.wait();

    console.log("7) Claim twice -> ", txReceipt.status);

  }catch(err){
    console.log("Error (case 7) ✓", err?.message || "Error (case 7)");
  }

  try{

    const toAddress = addr3.address;
    const proof = getMerkleProof(whitelist, toAddress);
    const txResponse = await contractInstance.mint(toAddress,5, proof);
    const txReceipt = await txResponse.wait();

    console.log("8) Claim not existing token -> ", txReceipt.status);

  }catch(err){
    console.log("Error (case 8) ✓", err?.message || "Error (case 8)");
  }

  try{

    const metadataURI = "QmbBJmNBckg997V16T6zK7jbD7vG2GEtfZXEFRjcoQ7X4P";
    const txResponse = await contractInstance.connect(addr1).createToken(metadataURI, merkleRootHash);
    const txReceipt = await txResponse.wait();

    console.log("9) Create token with ID 3 with no authorization -> ", txReceipt.status);

  }catch(err){
    console.log("Error (case 9) ✓", err?.message || "Error (case 9)");
  }

  try{

    const newIssuers = [addr1.address, addr6.address];
    const txResponse = await contractInstance.connect(owner).updateTokenIssuersBatch(newIssuers,[]);
    const txReceipt = await txResponse.wait();

    console.log("10) Add issuers in batch -> ", txReceipt.status);

  }catch(err){
    console.log("Error (case 10)", err?.message || "Error (case 10)");
  }
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
