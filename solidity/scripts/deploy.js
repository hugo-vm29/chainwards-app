const hre = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { MerkleTree } = require('merkletreejs')


const deployContractHelper = async () => {

  const baseUrl = "https://ipfs.filebase.io/ipfs/";

  const contractFactory = await hre.ethers.getContractFactory('Rewards');
  const contractInstance = await contractFactory.deploy("", baseUrl);

  await contractInstance.deployed();

  return { contractInstance };

}


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


async function main() {

  const { contractInstance } = await loadFixture(deployContractHelper);

  //const contractInstance =  await deployContractHelper();
  console.log(`Contract deployed to address: ${contractInstance.address}`);

  const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
  let whitelist = [addr2.address ,addr3.address ,addr4.address];
  const merkleRootHash = getMerkleRoot(whitelist);
  
  console.log(`owner: ${owner.address}`);
  console.log(`addr1: ${addr1.address}`);


  try{

    const metadataURI = "QmbBJmNBckg997V16T6zK7jbD7vG2GEtfZXEFRjcoQ7X4P";
    const txResponse = await contractInstance.createToken(metadataURI, merkleRootHash);
    const txReceipt = await txResponse.wait();
    console.log("Create token 1 -> ", txReceipt.status);

  }catch(err){
    console.log("Error (Create token 1)", err?.message || "Error (Create token 1)");
  }

  try{

    const toAddress = addr3.address;
    const proof = getMerkleProof(whitelist, toAddress);
    const txResponse = await contractInstance.claimToken(toAddress, 1, proof);
    const txReceipt = await txResponse.wait();

    console.log("Claim by addr3 -> ", txReceipt.status);

  }catch(err){
     console.log("Error (Claim by addr3)", err?.message || "Error (Claim by addr3)");
  }


  try{

    const metadataURI = "QmbBJmNBckg997V16T6zK7jbD7vG2GEtfZXEFRjcoQ7X4P";
    const txResponse = await contractInstance.connect(addr1).createToken(metadataURI, merkleRootHash);
    const txReceipt = await txResponse.wait();

    console.log("Create token 2 with NO auth -> ", txReceipt.status);

  }catch(err){
    console.log("Error (Create token 2 with NO auth) ", err?.message || "Error (Create token 2 with NO auth)");
  }

  try{
    
    const txResponse = await contractInstance.connect(owner).addTokenIssuer(addr1.address);
    const txReceipt = await txResponse.wait();

    console.log("Grant ISSUER role -> ", txReceipt.status);

  }catch(err){
    console.log("Error (Grant ISSUER role)", err?.message || "Error (Grant ISSUER role)");
  }

  try{

    const metadataURI = "QmbBJmNBckg997V16T6zK7jbD7vG2GEtfZXEFRjcoQ7X4P";
    const txResponse = await contractInstance.connect(addr1).createToken(metadataURI, merkleRootHash);
    const txReceipt = await txResponse.wait();

    console.log("Create token 2 with addr1 -> ", txReceipt.status);

  }catch(err){
    console.log("Error (Create token 2 with addr1)", err?.message || "Error (Create token 2 with addr1)");
  }

  try{

    const toAddress = addr5.address;
    const proof = getMerkleProof(whitelist, toAddress);
    const txResponse = await contractInstance.connect(owner).claimToken(toAddress,2, proof);
    const txReceipt = await txResponse.wait();

    console.log("Claim Token 2 by addr5 -> ", txReceipt.status);

  }catch(err){
    console.log("Error (Claim Token 2 by addr5)", err?.message || "Error (Claim Token 2 by addr5)");
  }

  try{

    let whitelistNew = [...whitelist, addr5.address];
    const newRoot = getMerkleRoot(whitelistNew);
    const txResponse = await contractInstance.connect(addr3).setMerkleRoot(2, newRoot);
    const txReceipt = await txResponse.wait();

    console.log("Change merkle root NOT auth -> ", txReceipt.status);

  }catch(err){
    console.log("Error (Change merkle root NOT auth)", err?.message || "Error (Change merkle root NOT auth)");
  }
  

  try{

    let whitelistNew = [...whitelist, addr5.address];
    const newRoot = getMerkleRoot(whitelistNew);
    const txResponse = await contractInstance.connect(addr1).setMerkleRoot(2, newRoot);
    const txReceipt = await txResponse.wait();

    console.log("Change merkle root -> ", txReceipt.status);

  }catch(err){
    console.log("Error (Change merkle root)", err?.message || "Error (Change merkle root)");
  }


  try{

    const toAddress = addr5.address;
    let whitelistNew = [...whitelist, toAddress];
    const proof = getMerkleProof(whitelistNew, toAddress);
    const txResponse = await contractInstance.connect(owner).claimToken(toAddress,2, proof);
    const txReceipt = await txResponse.wait();

    console.log("Claim Token 2 by addr5 -> ", txReceipt.status);

  }catch(err){
    console.log("Error (Claim Token 2 by addr5)", err?.message || "Error (Claim Token 2 by addr5)");
  }



  //contractInstance.addTokenIssuer();
  // //alumn A
  // let cid = "QmYus9xShwyCgDuF38SgQZCDAG2XH9QeAwTY8nCiACUCah";
  // await contractInstance.connect(addr1).mint(1, cid);
  // const meta1 = await contractInstance.connect(addr1).uri(1);
  // console.log("meta1", meta1);

  // //alumn B
  // cid = "QmToUFtuyMn9EkB2w4Qo73RnQLqokPcwLFk7H8PfTBxHCo";
  // await contractInstance.connect(addr2).mint(1, cid);
  // const meta2 = await contractInstance.connect(addr2).uri(1);
  // console.log("meta2", meta2);

  // const balanceAddr1 = await contractInstance.connect(owner).balanceOf(addr1.address, 1);
  // console.log("balanceAddr1", balanceAddr1);

  // const balanceAddr2 = await contractInstance.connect(owner).balanceOf(addr2.address, 1);
  // console.log("balanceAddr2", balanceAddr2);

  /*
    const balanceAddr1 = await contractInstance.connect(addr1).balanceOf(addr1.address, 1);
  */
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
