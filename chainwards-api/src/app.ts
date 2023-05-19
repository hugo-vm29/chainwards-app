import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import config from 'config';
import collectionRoutes from './routes/collections';
import accountsRoutes from './routes/accounts';

/* eslint-disable @typescript-eslint/no-var-requires */

const http = require('http');
const app: Express = express();

/** CORS setup **/
const allowedDomains = [...config.get<string>('allowedDomains').split(',')];

//type CustomOrigin = (requestOrigin: string | undefined, callback: (err: Error | null, origin?: StaticOrigin) => void) => void;

// Set up a root domain and check against it:
const corsOptions = {
  origin: function (
    requestOrigin: string | undefined,
    callback: (err: Error | null, origin: boolean | string[]) => void,
  ) {
    if (
      !requestOrigin ||
      allowedDomains.some((domain) => new URL(requestOrigin).hostname === domain)
    ) {
      callback(null, true);
    } else {
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

app.use(cors(corsOptions));

/**  pre-route middleware **/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**  routes  **/
app.use('/health-check', (req: Request, res: Response) => res.sendStatus(200));
app.use('/collections', collectionRoutes);
app.use('/accounts', accountsRoutes);

const server = http.createServer(app);
export default server;
