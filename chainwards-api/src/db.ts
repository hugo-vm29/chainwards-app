import { MongoClient } from 'mongodb';

let db: any = null;
let client: any = null;

export default {
  
  connect: async (connectionUrl: string) => {
    
    if (db) return db;
    console.log('DB Connecting ...');

    client = await MongoClient.connect(connectionUrl );

    if (!client) {
      throw new Error('Could not establish Mongo connection');
    }

    db = client.db("chainwards");
    console.log('DB ready !!');
    return db;
  },

  collection: (collectionName: string) => db.collection(collectionName),
  get: () => db,
  close: () => client.close(),
};
