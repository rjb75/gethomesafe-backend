import { ObjectId } from "mongodb";
import { CreatePartyRequestBody } from "../controllers/createParty";
import { dbClient, PARTY_COLLECTION } from "../models/mongo";
import { Party, User } from "../models/party.model";
import { generateInviteCode } from "./helper";

type CreatePartyArgs = { hostUserId: string } & CreatePartyRequestBody;

export const createNewParty = async ({
  partyName,
  endTime,
  hostUserId,
  hostDisplayName,
}: CreatePartyArgs): Promise<Party> => {
  const database = dbClient.getClient();

  const collection = database.collection<Party>(PARTY_COLLECTION);

  const hostMemberInfo: User = {
    _id: hostUserId,
    displayName: hostDisplayName,
    isHome: false,
    timestamp: -1,
  };

  const partyData: Party = {
    _id: new ObjectId(),
    name: partyName,
    hostUserId,
    inviteCode: generateInviteCode(),
    qrCode: "",
    active: true,
    members: [hostMemberInfo],
    endTime: endTime
      ? new Date(endTime)
      : new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  try {
    const result = await collection.insertOne(partyData);

    if (!result.acknowledged) {
      throw new Error("Failed to create party");
    }
  } catch (e) {
    console.log("createParty - Error on inserting document: ", e);
  }

  return partyData;
};
