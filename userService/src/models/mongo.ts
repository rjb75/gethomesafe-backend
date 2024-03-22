import {Db, MongoClient, ServerApiVersion} from "mongodb";

export const dbClient =  (() => {
    let client: Db;
    let url: string | undefined;
    let dbname: string | undefined;

    const createClient = () => {
        url = process.env.MONGO_CONNECTION_STRING;
        dbname = process.env.USER_DB_NAME;

        if (!url) {
            console.log("Cant get env");
            process.exit(1);
        }

        if (!dbname) {
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
        ).db(dbname)
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