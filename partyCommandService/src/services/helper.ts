import { User } from "../models/party.model";

export const getUserInfo = async (userId: string): Promise<User> => {
  const apiGatewayUrl = process.env.API_GATEWAY_URL;
  if (!apiGatewayUrl) {
    throw new Error("getUserInfo - USER_SERVICE_URL not set");
  }

  let userInfo: User | undefined;
  try {
    const response = await fetch(`${apiGatewayUrl}/api/getUserInfo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
      },
    });
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
