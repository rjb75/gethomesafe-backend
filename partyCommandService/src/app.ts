import express, { json, Request, Response } from "express";
import "dotenv/config";
import { createClient } from "redis";

import { createPartyValidationSchema } from "./validators/createPartyValidation";
import { createParty } from "./controllers/createParty";
import { joinPartyValidationSchema } from "./validators/joinPartyValidation";
import { joinParty } from "./controllers/joinParty";
import { handleLocationUpdate } from "./services/subscriber";

const app = express();
const port = 5000;

app.use(json());

export interface MessageStorage {
  currentLat: string;
  currentLong: string;
  userId: string;
  userToken: string;
  timestamp: string;
}

const URL_REDIS_CONN_0 = process.env.REDIS_ADDR_0;
const URL_REDIS_CONN_1 = process.env.REDIS_ADDR_1;

if (!URL_REDIS_CONN_0 || !URL_REDIS_CONN_1) {
  console.log("No Redis URL provided");
  process.exit(1);
}

const LOCATION_CHANNEL = process.env.LOCATION_CHANNEL;
if (!LOCATION_CHANNEL) {
  console.log("No LOCATION_CHANNEL provided");
  process.exit(1);
}

const redisClient0 = createClient({ url: URL_REDIS_CONN_0 });
const redisClient1 = createClient({ url: URL_REDIS_CONN_1 });

const redisClients = [redisClient0, redisClient1];

redisClients.forEach((client, index) => {
  client.on("error", (err) => console.log("Redis error on:" + index, err));

  client.subscribe(LOCATION_CHANNEL, async (message) => {
    const parsedMessage = JSON.parse(message);
    console.log(`Client ${index} handling event:`, parsedMessage);

    await handleLocationUpdate(parsedMessage);
  });
});

app.post("/api/create-party", createPartyValidationSchema, createParty);
app.post("/api/join-party", joinPartyValidationSchema, joinParty);
app.get("/api/heartbeat", (req: Request, res: Response) =>
  res.status(200).send()
);

try {
  const redisConnections = Promise.all(
    redisClients.map((client) => client.connect())
  );

  redisConnections.then(() => {
    console.log("Redis connected");
    app.listen(port, () => {
      console.log(`Party Command Service listening on port ${port}`);
    });
  });
} catch (err) {
  console.error("Error connecting to Redis:", err);
  process.exit(1);
}
