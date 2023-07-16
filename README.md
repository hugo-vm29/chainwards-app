# Chainwards (personal project)

**Author:** Hugo Alejandro Villalta Mena

## About the application

This applications allows any person to create, manage and distribute NFTs among a predefined list of accounts (persons) as a reward for accomplising certain goal or objetive.

As an admin you can create a collection that is aim to represent a reward/loyalty program for a store, company, school, etc. Next under this collection the admin can create any number of NFTs which will be the awards he is giving away to external persons/customers. Each NFT is unique and have an associated list of EOAs (external owned accounts) called "claimers" that will be the only ones allowed to claim (mint) this token. Each NFT can also have a list of associated attributes describing it which is known as the token's metadata.

As admin and owner of a collection you can also give permissions to other admins to view and create tokens in your collections. This is known as assigning an "issuer" for the collection. Issuers will be able to create new tokens with its corresponding list of claimers. Issuer will be able to see the entire list of tokens for the collection but can only modify the ones they created.

Beside the above, the application also allows the "claimers" to claim (mint) all the assigned NFTs. The application also offers a simple gallery page for the users to see all the tokens they have claimed in the past for all the collections.

## Blockchain integration

This application uses the standard ERC-1155 for the NFTs implementation. Also each collection created from the UI is managed by an invidual smart contract deployed to the blockchain.

The owner of the contract (account who deploys it) will have the highest priviliges when interacting with the contract. Other roles such as ISSUER can be granted to other accounts by the owner to allow certain actions/interactions with the contract.

After deploying a contract to represent a collection the next step is to list (create) tokens for such contract. Only listed tokens are considered available for minting.

For the whitelist feature mentioned on the previous section (predefined claimers) the smart contract uses merkle trees and merkle proofs to verify that the target account is allowed to mint the corresponding token. For listing a token on the smart contract the sender account (which is either the contract owner or an authorized issuer) needs to define a merkle tree root that will be associated to the corresponding token ID of that new token.

Next, for excuting the mint function a merkle proof for the specific token ID and target address have to be provided for the smart contract to verify it. Only if the proof results succesfull then the minting is allowed.

The contract code base is located under `solidity/contracts`.

Supported netwoks: `Polygon Mumbai`, `Goerli`.

## Using the application

The only requisite to use the application is to have [Metamask](https://metamask.io/) installed in your browser. 

To use the application as an admin (for creating collections) the application will generate a new wallet address for you that you need to add into your Metamask wallet. After that you will be able to login as admin.

To claim or view your NFT collection you should have the wallet address you are planning to use already added to Metamask as well.

## Running the application

Prerequisites:
</br>

|                   | Preferred       | Source                                                                        |
| ------------      | --------------- | ----------------------------------------------------------------------------- |
| Docker            | `20.10.11`      | [Download](https://docs.docker.com/engine/release-notes/)                     |
| Docker-compose    | `1.29.2`        | [Download](https://docs.docker.com/compose/release-notes/)                    |
| Node              | `v19.8.1`       | [Download](https://nodejs.org/en/download/)                                   |
| NPM               | `9.5.1`         | [Download](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) |

</br>

1. Clone this repo:

```
git clone https://github.com/hugo-vm29/chainwards-app
```

2. (optional) If you want to use a local mongo database with docker run :

```
docker-compose -f docker-compose-mongo.yml up -d
```
Then change MONGO_URL to `mongodb://mongo` in docker-compose.yml

3. Install dependencies for each project (frontend/backend):

```
cd chainwards-api
npm install
cd ..
cd chainwards-ui
npm install
cd ...
```

4. Make sure to be on the root of the project and run: 

```
docker-compose up
```

The UI should be available at `http://localhost:5173/`
