import server from './app';
import db from './db';
import config from 'config';

async function main() {

  try {

    // setup DB
    const mongoUrl = config.get<string>("dbUrl");
    await db.connect(mongoUrl);
    
    server.listen(8080);
    console.log('Server is running at http://localhost:8080');

  } catch (err) {
    process.exit(1);
  }
}

main();