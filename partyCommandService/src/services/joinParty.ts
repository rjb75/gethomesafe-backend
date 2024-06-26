import { JoinPartyRequestBody } from "../controllers/joinParty";
import { PARTY_COLLECTION, dbClient } from "../models/mongo";
import { Party, User } from "../models/party.model";

type JoinPartyArgs = { userId: string } & JoinPartyRequestBody;

export const addMemberToParty = async ({
  inviteCode,
  userId,
  userDisplayName,
}: JoinPartyArgs): Promise<Party> => {
  const database = dbClient.getClient();

  const collection = database.collection<Party>(PARTY_COLLECTION);

  const userInfo: User = {
    _id: userId,
    displayName: userDisplayName,
    isHome: false,
    timestamp: -1,
  };

  try {
    const updatedParty = await collection.findOneAndUpdate(
      { inviteCode: inviteCode },
      { $push: { members: userInfo } }
    );

    if (!updatedParty) {
      throw new Error("addMemberToParty - Invalid invite code");
    }
    return {
      ...updatedParty,
    };
  } catch (e) {
    console.log("addMemberToParty - Error on finding document: ", e);
    throw e;
  }
};
