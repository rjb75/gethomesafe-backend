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
}

const URL_REDIS_CONN = process.env.REDIS_ADDR;
if (!URL_REDIS_CONN) {
  console.log("No Redis URL provided");
  process.exit(1);
}

const LOCATION_CHANNEL = process.env.LOCATION_CHANNEL;
if (!LOCATION_CHANNEL) {
  console.log("No LOCATION_CHANNEL provided");
  process.exit(1);
}

const redisClient = createClient({ url: URL_REDIS_CONN });
redisClient.on("error", (err) => console.log("Redis Client Error", err));

redisClient.subscribe(LOCATION_CHANNEL, async (message) => {
  const parsedMessage = JSON.parse(message);
  console.log("event: " + parsedMessage);

  await handleLocationUpdate(parsedMessage);
});

app.post("/api/create-party", createPartyValidationSchema, createParty);
app.post("/api/join-party", joinPartyValidationSchema, joinParty);
app.get("/api/heartbeat", (req: Request, res: Response) =>
  res.status(200).send()
);

redisClient.connect().then(() => {
  console.log("Redis connected");
  app.listen(port, () => {
    console.log(`Party Command Service listening on port ${port}`);
  });
});
