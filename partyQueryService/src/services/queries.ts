import { ObjectId } from "mongodb";
import { PARTY_COLLECTION, dbClient } from "../models/mongo";
import { Party } from "../models/party.model";

export const getUserParties = async (userId: string): Promise<Party[]> => {
  const database = dbClient.getClient();

  const collection = database.collection<Party>(PARTY_COLLECTION);

  try {
    const result = await collection.find({ "members._id": userId }).toArray();

    return result;
  } catch (e) {
    console.log(e);
    throw new Error("getParties - Error on fetching parties");
  }
};

export const getPartyStatus = async (
  partyId: string
): Promise<Party | null> => {
  const database = dbClient.getClient();

  const collection = database.collection<Party>(PARTY_COLLECTION);
  try {
    const result = await collection.findOne({
      _id: new ObjectId(partyId),
    });

    return result;
  } catch (e) {
    console.log(e);
    throw new Error("getPartyStatus - Error on fetching party");
  }
};

export const getPartyByInviteCode = async (
  inviteCode: string
): Promise<Party | null> => {
  const database = dbClient.getClient();

  const collection = database.collection<Party>(PARTY_COLLECTION);

  try {
    const result = await collection.findOne({
      inviteCode,
    });

    return result;
  } catch (e) {
    console.log(e);
    throw new Error("getPartyInviteCode - Error on fetching party invite code");
  }
};
