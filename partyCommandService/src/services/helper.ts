export const getIsUserHome = async (
  userToken: string,
  currentLat: string,
  currentLong: string
): Promise<boolean> => {
  const apiGatewayUrl = process.env.API_GATEWAY_URL;
  if (!apiGatewayUrl) {
    throw new Error("getIsUserHome - API_GATEWAY_URL not set");
  }

  let isUserHomeResponse: { isUserHome: boolean };

  try {
    const response = await fetch(
      `${apiGatewayUrl}/api/isUserHome?currentLat=${currentLat}&currentLong=${currentLong}`,
      {
        method: "GET",
        headers: {
          Authorization: userToken,
        },
      }
    );

    isUserHomeResponse = await response.json();
  } catch (e) {
    throw new Error("getIsUserHome - Error on fetching user info");
  }

  if (!isUserHomeResponse) {
    throw new Error("Failed to get user info");
  }

  return isUserHomeResponse.isUserHome;
};
