import { Db, MongoClient, ServerApiVersion } from "mongodb";

export const dbClient = (() => {
  let client: Db;

  const createClient = () => {
    const url = process.env.MONGO_URL;
    const dbName = process.env.DB_NAME;

    if (!url) {
      console.log("Cant get mongo connection string");
      process.exit(1);
    }

    if (!dbName) {
      console.log("Cant get mongo db name");
      process.exit(1);
    }

    return new MongoClient(url, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    }).db(dbName);
  };

  return {
    getClient: () => {
      if (!client) {
        client = createClient();
      }
      return client;
    },
  };
})();

export const PARTY_COLLECTION = "party";
