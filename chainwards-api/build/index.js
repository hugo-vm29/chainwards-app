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
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./db"));
const port = 8080;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // setup DB
            const mongoUrl = process.env.MONGO_URL;
            if (!mongoUrl)
                throw new Error('Missing DB url');
            yield db_1.default.connect(mongoUrl);
            app_1.default.listen(port);
            console.log(`Server is listening on port ${port}`);
        }
        catch (err) {
            console.log('API error', (err === null || err === void 0 ? void 0 : err.message) || '');
            process.exit(1);
        }
    });
}
main();
