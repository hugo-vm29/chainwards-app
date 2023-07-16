import server from './app';
import db from './db';

const port = 8080;

async function main() {
  try {
    // setup DB
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) throw new Error('Missing DB url');

    await db.connect(mongoUrl);

    server.listen(port);
    console.log(`Server is listening on port ${port}`);
  } catch (err: any) {
    console.log('API error', err?.message || '');
    process.exit(1);
  }
}

main();
