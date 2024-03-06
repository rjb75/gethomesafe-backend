import { ObjectId } from "mongodb";
import { PARTY_COLLECTION, dbClient } from "../models/mongo";
import { Party } from "../models/party.model";

export const getParties = async (): Promise<Party[]> => {
  const database = dbClient.getClient();

  const collection = database.collection<Party>(PARTY_COLLECTION);

  try {
    const result = await collection.find().toArray();

    return result;
  } catch (e) {
    console.log(e);
    throw new Error("getParties - Error on fetching parties");
  }
};

export const getPartyStatus = async (
  partyId: string
): Promise<boolean | null> => {
  const database = dbClient.getClient();

  const collection = database.collection<Party>(PARTY_COLLECTION);

  try {
    const result = await collection.findOne({ _id: new ObjectId(partyId) });

    return result ? result.active : null;
  } catch (e) {
    console.log(e);
    throw new Error("getParty - Error on fetching party");
  }
};

export const getPartyInviteCode = async (
  partyId: string
): Promise<string | null> => {
  const database = dbClient.getClient();

  const collection = database.collection<Party>(PARTY_COLLECTION);

  try {
    const result = await collection.findOne(
      { _id: new ObjectId(partyId) },
      { projection: { inviteCode: 1 } }
    );

    return result ? result.inviteCode : null;
  } catch (e) {
    console.log(e);
    throw new Error("getPartyInviteCode - Error on fetching party invite code");
  }
};
