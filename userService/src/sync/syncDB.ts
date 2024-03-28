import {MongoDBDuplexConnector, MongoTransferer} from "mongodb-snapshot";
import store from "./store";
import {dbClient} from "../models/mongo";
import * as http from "http";


export const syncDB = async () => {
    console.log("started db sync")
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

    let hosts = s.getHosts();
    console.log(hosts)
    let reqs = [];
    for (let i = 0; i < hosts.length; i++) {
        reqs.push(http.get(`http://${hosts[i]}:3000/api/heartbeat`).on('error', (err) => console.log(err)));
    }

    let primaryHost: string;
    return Promise.race(reqs).then(async (res) => {
        res.on('response', async (res) => {
            console.log(`headers here ${res.headers["x-primary-host"]}`)
            console.log(res.headers["x-primary-host"]);
            // @ts-ignore
            primaryHost = res.headers["x-primary-host"]

            if (primaryHost === 'undefined') {
                primaryHost = 'user-service-2';
            }

            console.log(`primaryHost: ${primaryHost}`);

            let dbNum = Number(primaryHost.split('-')[2])

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

            await store.getInstance().applyQueueUpdates();
            console.log("Applied updates, db ready");
            store.getInstance().setDBReady(true);
        })
    })
}