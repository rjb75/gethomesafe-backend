import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { createNewParty } from "../services/createParty";

export interface CreatePartyRequestBody {
  partyName: string;
  endTime?: string;
  hostDisplayName: string;
}

export const createParty = async (
  req: Request<{}, {}, CreatePartyRequestBody, {}>,
  res: Response
) => {
  const { partyName, endTime, hostDisplayName } = req.body;
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(300).send(valResult.array());
  }

  const hostUserId = req.get("X-User-Id");
  if (!hostUserId) {
    res.status(500).send("No user id provided");
    return;
  }

  try {
    const partyData = await createNewParty({
      partyName,
      endTime,
      hostUserId,
      hostDisplayName,
    });

    res.status(201).json(partyData);
  } catch (e) {
    res.status(500).send("Server Error");
  }
};
