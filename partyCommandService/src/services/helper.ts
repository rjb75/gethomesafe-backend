export const getIsUserHome = async (
  token: string,
  currentLat: number,
  currentLong: number
): Promise<boolean> => {
  const gatewayHosts =
    process.env.ENVIRONMENT === "development"
      ? process.env.GATEWAY_SERVICE_HOSTS_DEV
      : process.env.GATEWAY_SERVICE_HOSTS;

  if (!gatewayHosts) {
    throw new Error("getIsUserHome - No gateway service hosts provided");
  }

  const gatewayHostsList = gatewayHosts.split(",");
  let gatewayServiceHost;
  let isUserHomeResponse: { isUserHome: boolean };

  try {
    for (let i = 0; i < gatewayHostsList.length; i++) {
      const host = gatewayHostsList[i];
      try {
        await fetch(`${host}/api/heartbeat`, {
          method: "GET",
        });
      } catch (e) {
        console.log("Request failed on host: ", host);
        console.log("Error: ", e);
        continue;
      }

      gatewayServiceHost = host;
      break;
    }

    if (!gatewayServiceHost) {
      throw new Error("getIsUserHome - no response from gateway hosts");
    }

    console.log("Gateway host found: ", gatewayServiceHost);

    const response = await fetch(
      `${gatewayServiceHost}/api/isUserHome?currentLat=${currentLat}&currentLong=${currentLong}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
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

  console.log("isUserHomeResponse: ", isUserHomeResponse);

  return isUserHomeResponse.isUserHome;
};

export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8);
};
