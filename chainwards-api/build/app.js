"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("config"));
const collections_1 = __importDefault(require("./routes/collections"));
const accounts_1 = __importDefault(require("./routes/accounts"));
const tokens_1 = __importDefault(require("./routes/tokens"));
/* eslint-disable @typescript-eslint/no-var-requires */
const http = require('http');
const app = (0, express_1.default)();
/** CORS setup **/
const allowedDomains = [...config_1.default.get('allowedDomains').split(',')];
//type CustomOrigin = (requestOrigin: string | undefined, callback: (err: Error | null, origin?: StaticOrigin) => void) => void;
// Set up a root domain and check against it:
const corsOptions = {
    origin: function (requestOrigin, callback) {
        if (!requestOrigin ||
            allowedDomains.some((domain) => new URL(requestOrigin).hostname === domain)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'), allowedDomains);
        }
    },
    credentials: true,
};
// const corsOptions = {
//   origin(origin: string, callback: (arg0: Error | null, arg1: boolean | undefined) => void) {
//     if ( !origin || allowedDomains.some( domain => {
//         const hostName = new URL(origin).hostname;
//         return domain === hostName;
//       })
//     ) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'), false);
//     }
//   },
//   credentials: true,
// };
app.use((0, cors_1.default)(corsOptions));
/**  pre-route middleware **/
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
/**  routes  **/
app.use('/health-check', (req, res) => res.sendStatus(200));
app.use('/collections', collections_1.default);
app.use('/accounts', accounts_1.default);
app.use('/tokens', tokens_1.default);
const server = http.createServer(app);
exports.default = server;
