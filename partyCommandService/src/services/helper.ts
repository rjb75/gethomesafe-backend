export const getIsUserHome = async (
  userId: string,
  currentLat: number,
  currentLong: number
): Promise<boolean> => {
  const userHosts = process.env.USER_SERVICE_HOSTS;
  const USER_SERVICE_PORT = 3000;

  if (!userHosts) {
    throw new Error("getIsUserHome - No user service hosts provided");
  }

  const userHostsList = userHosts.split(",");
  let userServiceLeaderHost;
  let isUserHomeResponse: { isUserHome: boolean };

  try {
    for (let i = 0; i < userHostsList.length; i++) {
      const host = userHostsList[i];
      let heartbeatResponse;
      try {
        heartbeatResponse = await fetch(
          `http://${host}:${USER_SERVICE_PORT}/api/heartbeat`,
          {
            method: "GET",
          }
        );
      } catch (e) {
        console.log("Request failed on host: ", host);
        console.log("Error: ", e);
        continue;
      }

      userServiceLeaderHost = heartbeatResponse.headers.get("X-Primary-Host");
      if (userServiceLeaderHost) {
        break;
      }
    }

    if (!userServiceLeaderHost) {
      throw new Error("getIsUserHome - No leader found");
    }

    console.log("Leader found: ", userServiceLeaderHost);

    const response = await fetch(
      `http://${userServiceLeaderHost}:${USER_SERVICE_PORT}/api/isUserHome?currentLat=${currentLat}&currentLong=${currentLong}`,
      {
        method: "GET",
        headers: {
          "X-User-Id": userId,
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
