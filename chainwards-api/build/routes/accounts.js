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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const dappUtils_1 = require("../utils/dappUtils");
/* eslint-disable camelcase */
const router = express_1.default.Router({ mergeParams: true });
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { publicAddr, username } = req.body;
        const findAccount = yield db_1.default.collection('accounts').findOne({ 'wallet.address': publicAddr }, {
            projection: {
                _id: 1,
                'wallet.address': 1,
            },
        });
        if (findAccount)
            return res.status(400).send({ error: 'Duplicated account' });
        const wallet = (0, dappUtils_1.createWallet)();
        const newUser = {
            displayName: username,
            name: '',
            lastName: '',
            wallet: Object.assign({}, wallet),
        };
        const dbResponse = yield db_1.default.collection('accounts').insertOne(newUser);
        console.log('newUser', newUser);
        return res.json(Object.assign({ id: dbResponse.insertedId, displayName: username }, wallet));
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
router.get('/findByWallet/:walletAddr', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddr } = req.params;
        const accountsData = yield db_1.default.collection('accounts').findOne({ 'wallet.address': walletAddr.toLowerCase() }, {
            projection: {
                _id: 1,
                displayName: 1,
                'wallet.address': 1,
            },
        });
        if (!accountsData)
            return res.status(404).send({ error: 'No account found' });
        return res.json(accountsData);
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
router.get('/authenticate/:walletAddr', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddr } = req.params;
        const accountsData = yield db_1.default.collection('accounts').findOne({ 'wallet.address': walletAddr.toLowerCase() }, {
            projection: {
                _id: 1,
                displayName: 1,
                'wallet.address': 1,
            },
        });
        if (!accountsData)
            return res.status(404).send({ error: 'No account found' });
        const tokenPayload = {
            userId: accountsData._id,
            displayname: accountsData.displayName,
            walletAddress: accountsData.wallet.address
        };
        const options = {
            expiresIn: '1d',
            issuer: 'chainwards-api',
            audience: 'chainwards-ui',
        };
        const privateKey = '';
        const accessToken = jsonwebtoken_1.default.sign(tokenPayload, privateKey, options);
        return res.json({ token: accessToken });
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
exports.default = router;
