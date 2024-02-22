import { ObjectId } from "mongodb";
import { CreatePartyRequestBody } from "../controllers/createParty";
import { dbClient, PARTY_COLLECTION } from "../models/mongo";
import { Party, User } from "../models/party.model";

type CreatePartyArgs = CreatePartyRequestBody;

export const createNewParty = async ({
  name,
  endTime,
  hostUserId,
}: CreatePartyArgs): Promise<Party> => {
  const database = dbClient.getClient();

  const collection = database.collection<Party>(PARTY_COLLECTION);

  const userServiceUrl = process.env.USER_SERVICE_URL;
  if (!userServiceUrl) {
    throw new Error("createParty - USER_SERVICE_URL not set");
  }

  const userInfo = await getUserInfo(hostUserId);

  const hostMemberInfo: User = {
    _id: userInfo._id,
    displayName: userInfo.displayName,
    address: {
      coordinates: {
        lat: userInfo.address.coordinates.lat,
        long: userInfo.address.coordinates.long,
      },
    },
  };

  const partyData: Party = {
    _id: new ObjectId(),
    name,
    hostUserId: new ObjectId(hostUserId),
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

const generateInviteCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getUserInfo = async (userId: string): Promise<User> => {
  const userServiceUrl = process.env.USER_SERVICE_URL;
  if (!userServiceUrl) {
    throw new Error("getUserInfo - USER_SERVICE_URL not set");
  }

  let userInfo: User | undefined;
  try {
    const response = await fetch(
      `${userServiceUrl}/api/getUserInfo?_id=${userId}`
    );
    userInfo = await response.json();

    if (!userInfo) {
      throw new Error("User not found");
    }
  } catch (e) {
    console.log("getUserInfo - Error on fetching user info: ", e);
  }

  if (!userInfo) {
    throw new Error("Failed to get user info");
  }

  return userInfo;
};
