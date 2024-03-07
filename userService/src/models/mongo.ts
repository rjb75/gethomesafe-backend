import {Db, MongoClient, ServerApiVersion} from "mongodb";

export const dbClient =  (() => {
    let client: Db;

    const createClient = () => {
        const url = process.env.USER_MONGO_URL;
        const dbName = process.env.USER_DB_NAME;

        if (!url) {
            console.log("Cant get env");
            process.exit(1);
        }

        return new MongoClient(url,  {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                }
            }
        ).db(dbName)
    }

    return {
        getClient: () => {
            if (!client) {
                client = createClient();
            }
            return client;
        }
    }
})()