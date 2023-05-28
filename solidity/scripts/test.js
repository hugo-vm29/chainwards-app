const hre = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { MerkleTree } = require('merkletreejs')
//const ethers = require('ethers');

const getMerkleRoot = (whitelist) => {

  const { keccak256 } = hre.ethers.utils;
  let leaves = whitelist.map((addr) => keccak256(addr))
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
  const merkleRootHash = merkleTree.getHexRoot();
  return merkleRootHash;
}

const getMerkleProof = (whitelist, address) => {

  const { keccak256 } = ethers.utils;
  let leaves = whitelist.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
  let hashedAddress = keccak256(address);
  const proof = merkleTree.getHexProof(hashedAddress);
  return proof;
}


const deployContract = async (provider) => {

  let RewardsContract = await hre.artifacts.readArtifact("Rewards");
  let privateKey = "509b5133625e8f77b321cd14ddf47b1455fc82530115ea6062d3ab14c315c962";
  let signer = new ethers.Wallet(privateKey, provider);

  const factory = new hre.ethers.ContractFactory(
    RewardsContract.abi,
    RewardsContract.bytecode,
    signer
  );

  const baseMetadataURI = "https://ipfs.filebase.io/ipfs/";
  const contractInstance = await factory.deploy("HARDHAT T1",baseMetadataURI);
  
  //console.log("contractInstance : ", contractInstance);

  console.log( "address" , contractInstance.address);
  console.log( "hash" , contractInstance.deployTransaction.hash);

}


async function main() {

  const url = "http://127.0.0.1:8545/";
  const provider = new ethers.providers.JsonRpcProvider(url);

  try{
    
    //await deployContract(provider);

    let whitelist = ["0xb8790386c88565e681b708bc227B76Cd0733c603", "0x25DD09A8d51460730a896e7CD58D87daD624c063", "0x39B81615B0C6604DEA445D5cb8eF5bbFD086C7bd"];
    const merkleRootHash = getMerkleRoot(whitelist);
    console.log("merkleRootHash", merkleRootHash);

    const leaf = "0xb8790386c88565e681b708bc227B76Cd0733c603"
    const merkleProof = getMerkleProof(whitelist,leaf);
    console.log("merkleProof", merkleProof);

  }catch(err){
    console.log("Error", err?.message || "");
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
