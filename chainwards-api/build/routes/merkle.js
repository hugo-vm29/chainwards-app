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
const dappUtils_1 = require("../utils/dappUtils");
/* eslint-disable camelcase */
const router = express_1.default.Router({ mergeParams: true });
router.post('/root', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const routeName = { logSource: 'post/merkle/root' };
    try {
        const { addressList } = req.body;
        /** Compute merkle root hash with for a list of addresses (whitelisting functionality) **/
        const whitelist = (0, dappUtils_1.stringToAdressArray)(addressList);
        const merkleRoot = (0, dappUtils_1.getMerkleRoot)(whitelist);
        return res.json({
            merkleRoot: merkleRoot,
        });
    }
    catch (err) {
        console.error(`Error (${routeName}): ${err}`);
        return next(err);
    }
}));
exports.default = router;
