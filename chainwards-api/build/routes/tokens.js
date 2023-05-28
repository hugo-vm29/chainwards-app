"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const config_1 = __importDefault(require("config"));
const multer_1 = __importDefault(require("multer"));
const nft_storage_1 = require("nft.storage");
const dappUtils_1 = require("../utils/dappUtils");
const memStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: memStorage });
/* eslint-disable camelcase */
const router = express_1.default.Router({ mergeParams: true });
const NFT_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDNDQkI2ODdCNDQwNDg5NTkyMjg3N0QzRWVCRTA3NmU4OTk1Y0U1MDIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4NTA0OTk0MzEyOSwibmFtZSI6IkNoYWlud2FyZHNBcHAifQ.Zx8HlRjaCp1zD6ZbbgHNfdNy8_WJYxiSiVWtOfHb57k';
const endpoint = 'https://api.nft.storage';
router.post('/metadata/upload', upload.single('file'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).send({ error: 'Image is required' });
        const storageServiceKey = config_1.default.get('nft_storage_key');
        if (!storageServiceKey)
            return res.status(500).send({ error: 'Server is unable to upload metadata, missing key' });
        const { name, description, attributes, claimers } = req.body;
        const fileData = req.file.buffer;
        /** ERC-1155 Metadata **/
        const formattedItems = JSON.parse(attributes);
        const additonalAttributes = [];
        //additional attibutes
        formattedItems.forEach((item) => {
            additonalAttributes.push({
                trait_type: item.key,
                value: item.value
            });
        });
        //console.log("additonalAttributes", additonalAttributes);
        const newFile = new nft_storage_1.File([fileData], req.file.originalname, { type: req.file.mimetype });
        const tokenMetadata = {
            image: newFile,
            name: name,
            description: description,
            attributes: additonalAttributes
        };
        // const tokenURISample = "bafyreic5th7uhzxeukjf6k4e5zzq4cvfjrt6c4kbj2ehi577kpy2mwsrya/metadata.json";
        // const rootSample = "0x37181768d1bbc7e81f1c388228b2f8012b613ced2a4d988a5522069587f2a0a7";
        // return res.json({
        //   tokenURI: tokenURISample,
        //   merkleRoot: rootSample
        // });
        /** Compute merkle root hash with claimers (whitelisting functionality) **/
        let addresses = claimers.trim().split(',');
        let whitelist = [];
        addresses.forEach((item) => {
            if (item !== "" && (0, dappUtils_1.validateAddress)(item)) {
                whitelist.push(item.toLocaleLowerCase());
            }
        });
        const merkleRoot = (0, dappUtils_1.getMerkleRoot)(whitelist);
        const client = new nft_storage_1.NFTStorage({ endpoint: new URL(endpoint), token: storageServiceKey });
        const serviceResponse = yield client.store(tokenMetadata);
        const tokenURI = serviceResponse.url.replace("ipfs://", "");
        return res.json({
            tokenURI: tokenURI,
            merkleRoot: merkleRoot
        });
        //const client = new NFTStorage({ endpoint: endpoint, token: NFT_STORAGE_TOKEN })
        // console.log("test 1", (typeof req));
        // console.log("test 2", (typeof req.file));
        //console.log("req file", req.file);
        //console.log("token name", name);
        //const fileExtension = extname(req.file.originalname);
        // const metadata = await client.store(nftMetadata);
        // console.log('FULL metadata: -->\n', metadata);
        // console.log('IPFS URL for the metadata --> ', metadata.url)
        // console.log('metadata.json contents --> \n', metadata.data)
        // console.log('metadata.json with IPFS gateway URLs--> \n', metadata.embed());
        // https://nftstorage.link/ipfs/bafyreibxarf4m665m4563alat4ydyq5nirx76yquw6vtxvnxmlpoxllegm/metadata.json
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const logMetaData = { logSource: 'post/routes/tokens' };
    try {
        const { tokenId, issuer, contract, txnHash, chainId, claimers } = req.body;
        const txnObject = {
            from: issuer.toLowerCase(),
            to: contract,
            transactionHash: txnHash,
            chainId: Number(chainId),
            status: 'completed',
            transactionType: 'ISSUE',
            contractAddress: contract,
            timestamp: new Date()
        };
        const txnResponse = yield db_1.default.collection('transactions').insertOne(txnObject);
        let addresses = claimers.trim().split(',');
        let whitelist = [];
        addresses.forEach((item) => {
            if (item !== "" && (0, dappUtils_1.validateAddress)(item)) {
                whitelist.push(item.toLocaleLowerCase());
            }
        });
        const tokenObject = {
            tokenId: tokenId,
            transactionId: txnResponse.insertedId,
            whitelist: whitelist,
            claimable: true,
            timestamp: new Date(),
        };
        yield db_1.default.collection('tokens').insertOne(tokenObject);
        return res.json({
            tokenId: tokenId,
            transactionId: txnResponse.insertedId
        });
    }
    catch (err) {
        console.error(`Error (${logMetaData}): ${err}`);
        return next(err);
    }
}));
exports.default = router;
