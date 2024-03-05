export const getIsUserHome = async (userId: string): Promise<boolean> => {
  const apiGatewayUrl = process.env.API_GATEWAY_URL;
  if (!apiGatewayUrl) {
    throw new Error("getUserInfo - API_GATEWAY_URL not set");
  }

  let userInfo: { isUserHome: boolean };
  try {
    const response = await fetch(`${apiGatewayUrl}/api/isUserHome`, {
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

  return userInfo.isUserHome;
};
