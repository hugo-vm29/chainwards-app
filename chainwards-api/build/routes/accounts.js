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
const dappUtils_1 = require("../utils/dappUtils");
/* eslint-disable camelcase */
const router = express_1.default.Router({ mergeParams: true });
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        //const hashedPass = await bcrypt.hash( password, 10);
        return res.json({
            id: "'646441aacb06612ac957d02f",
            address: "0xb8790386c88565e681b708bc227B76Cd0733c603",
            signingKey: {
                privateKey: "0xea90d99fae1db2935aca86a2b0f7b9efaa76b4c278f5ce2fd56dc8edcc35e178",
                publicKey: "0x0250a25665c4489ae3fe464d3d08f3c69625e12560ea0b86aae521603e44621101"
            }
        });
        const wallet = (0, dappUtils_1.createWallet)();
        const newUser = {
            displayName: username,
            name: "",
            lastName: "",
            wallet: Object.assign({}, wallet)
        };
        const dbResponse = yield db_1.default.collection('accounts').insertOne(newUser);
        console.log("newUser", newUser);
        return res.json(Object.assign({ id: dbResponse.insertedId }, wallet));
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
router.get('/findByWallet/:walletAddr', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddr } = req.params;
        const collectonData = yield db_1.default
            .collection('accounts')
            .findOne({ 'wallet.address': walletAddr }, {
            projection: {
                _id: 1,
                name: 1,
                'wallet.address': 1
            },
        });
        if (!collectonData)
            return res.status(404).send({ error: "No account found" });
        return res.json(collectonData);
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
exports.default = router;
