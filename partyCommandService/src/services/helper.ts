import { User } from "../models/party.model";

export const getUserInfo = async (userId: string): Promise<User> => {
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
    throw new Error("getUserInfo - Error on fetching user info");
  }

  if (!userInfo) {
    throw new Error("Failed to get user info");
  }

  return userInfo;
};
