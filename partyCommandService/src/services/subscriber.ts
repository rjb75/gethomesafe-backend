import { MessageStorage } from "../app";
import { PARTY_COLLECTION, dbClient } from "../models/mongo";
import { Party } from "../models/party.model";
import { getIsUserHome } from "./helper";

export const handleLocationUpdate = async (message: MessageStorage) => {
  let isHome: boolean = false;
  console.log("Handling location update");
  try {
    isHome = await getIsUserHome(
      message.userToken,
      message.currentLat,
      message.currentLong
    );

    console.log(message);
  } catch (e) {
    throw new Error("Error on getting user location" + e);
  }

  if (isHome) {
    console.log("User is home... updating status");

    const database = dbClient.getClient();

    const collection = database.collection<Party>(PARTY_COLLECTION);

    try {
      const updatedParty = await collection.updateMany(
        { active: true, "members._id": message.userId },
        { $set: { "members.$.isHome": true } }
      );

      console.log("Updated party result:", updatedParty);
    } catch (e) {
      throw new Error("Error on updating party" + e);
    }

    return;
  }

  console.log("User is not home");
};
