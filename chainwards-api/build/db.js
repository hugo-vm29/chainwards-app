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
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
let db = null;
let client = null;
exports.default = {
    connect: (connectionUrl) => __awaiter(void 0, void 0, void 0, function* () {
        if (db)
            return db;
        console.log('DB Connecting ...');
        client = yield mongodb_1.MongoClient.connect(connectionUrl);
        if (!client) {
            throw new Error('Could not establish Mongo connection');
        }
        db = client.db("chainwards");
        console.log('DB ready !!');
        return db;
    }),
    collection: (collectionName) => db.collection(collectionName),
    get: () => db,
    close: () => client.close(),
};
