import {MongoDBDuplexConnector, MongoTransferer} from "mongodb-snapshot";
import store from "./store";
import {dbClient} from "../models/mongo";


export const syncDB = async () => {
    const s = store.getInstance();

    const url = process.env.MONGO_CONNECTION_STRING;
    const dbname = process.env.USER_DB_NAME;

    if (!url) {
        console.log("Cant get env");
        process.exit(1);
    }

    if (!dbname) {
        console.log("Cant get env");
        process.exit(1);
    }

    const mongo_connector_1 = new MongoDBDuplexConnector({
        connection: {
            uri: url,
            dbname: dbname,
        },
    });

    while (s.getLeaderHostname() === undefined) {await new Promise(resolve => setTimeout(resolve, 500));}

    if (!s.isLeader()) {
        let dbNum = Number(s.getLeaderHostname()?.split('-')[2])

        const mongo_connector_2 = new MongoDBDuplexConnector({
            connection: {
                uri: `mongodb://user_mongodb${dbNum}:27017`,
                dbname: dbname,
            },
        });

        const db = dbClient.getClient();
        await db.dropDatabase();

        const transferer = new MongoTransferer({
            source: mongo_connector_2,
            targets: [mongo_connector_1],
        });

        for await (const {total, write} of transferer) {
            console.log(`remaining bytes to write: ${total - write}`);
        }
    }

    await store.getInstance().applyQueueUpdates();
    console.log("Applied updates, db ready");
    store.getInstance().setDBReady(true);
}