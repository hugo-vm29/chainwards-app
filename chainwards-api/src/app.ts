import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import config from 'config';
import collectionRoutes from './routes/collections';
import accountsRoutes from './routes/accounts';
import tokenRoutes from './routes/tokens';
import merkleTreeRoutes from './routes/merkle';

/* eslint-disable @typescript-eslint/no-var-requires */

const http = require('http');
const app: Express = express();

/** CORS setup **/
const allowedDomains = [...config.get<string>('allowedDomains').split(',')];

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

app.use(cors(corsOptions));

/**  pre-route middleware **/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**  routes  **/
app.get("/", (req, res) => {
  res.send("Server running !!!");
});

app.use('/health-check', (req: Request, res: Response) => res.sendStatus(200));
app.use('/collections', collectionRoutes);
app.use('/accounts', accountsRoutes);
app.use('/tokens', tokenRoutes);
app.use('/merkle', merkleTreeRoutes);

// const server = http.createServer(app);
// export default server;

const PORT = 9092;

try {
  
  app.listen(PORT, () => { 
    console.log(`API running on port ${PORT}`);
  });

} catch (err) {
    console.error(err);
    process.exit(1);
}
