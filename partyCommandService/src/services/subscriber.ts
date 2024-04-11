import { RedisMessage } from "../app";
import { PARTY_COLLECTION, dbClient } from "../models/mongo";
import { Party } from "../models/party.model";
import { getIsUserHome } from "./helper";

export const handleLocationUpdate = async (message: RedisMessage) => {
  let isHome: boolean = false;
  console.log("Handling location update");
  try {
    isHome = await getIsUserHome(
      message.userId,
      message.currentLat,
      message.currentLat
    );
  } catch (e) {
    throw new Error("Error on getting user location" + e);
  }

  if (isHome) {
    console.log("User is home... updating status");

    const database = dbClient.getClient();

    const collection = database.collection<Party>(PARTY_COLLECTION);

    const parsedTimestamp = parseInt(message.timestamp);
    try {
      const updatedParties = await collection.updateMany(
        {
          active: true,
          "members._id": message.userId,
          "members.timestamp": { $lt: parsedTimestamp },
        },
        {
          $set: {
            "members.$[elem].isHome": true,
            "members.$[elem].timestamp": parsedTimestamp,
          },
        },
        {
          arrayFilters: [
            {
              "elem._id": message.userId,
              "elem.timestamp": { $lt: parsedTimestamp },
            },
          ],
        }
      );

      console.log("Updated party result:", updatedParties);
    } catch (e) {
      throw new Error("Error on updating party" + e);
    }

    return;
  }

  console.log("User is not home");
};
