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
const config_1 = __importDefault(require("config"));
/* eslint-disable camelcase */
const router = express_1.default.Router({ mergeParams: true });
const usersDB = [];
router.get('/:pubKey', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pubKey } = req.params;
        const userInfo = yield db_1.default
            .collection('accounts')
            .findOne({ 'publicKey': pubKey });
        if (userInfo) {
            const tokenPayload = {
                user_data: {
                    id: userInfo._id.toString(),
                    email: userInfo.email || "",
                    role: userInfo.role,
                }
            };
            const jwtPvtKey = config_1.default.get("jwtSecret");
            const accessToken = jsonwebtoken_1.default.sign(tokenPayload, jwtPvtKey, { expiresIn: '2h', issuer: "badgesAPI", audience: "badgesUI" });
            return res.json({ address: userInfo.publicKey, token: accessToken });
        }
        return res.status(404).send({ error: "User not found" });
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
router.post('/enroll-student', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { publicKey } = req.body;
        const userInfo = yield db_1.default
            .collection('accounts')
            .findOne({ 'publicKey': publicKey });
        if (userInfo)
            return res.status(400).send({ error: "User already enrolled" });
        const newUser = {
            publicKey: publicKey,
            role: "student"
        };
        const { insertedId } = yield db_1.default.collection('accounts').insertOne(newUser);
        if (insertedId) {
            const tokenPayload = {
                id: insertedId,
                email: "",
                role: "student",
            };
            const jwtPvtKey = config_1.default.get("jwtSecret");
            const accessToken = jsonwebtoken_1.default.sign(tokenPayload, jwtPvtKey, { expiresIn: '1h', issuer: "badgesAPI", audience: "badgesUI" });
            return res.json({ token: accessToken });
        }
        return res.status(400).send({ error: "Unable to enroll user" });
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return next(err);
    }
}));
exports.default = router;
