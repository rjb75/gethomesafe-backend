import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { createNewParty } from "../services/createParty";

export interface CreatePartyRequestBody {
  name: string;
  endTime?: string;
  hostUserId: string;
  hostDisplayName: string;
}

export const createParty = async (
  req: Request<{}, {}, CreatePartyRequestBody, {}>,
  res: Response
) => {
  const { name, endTime, hostUserId, hostDisplayName } = req.body;
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(300).send(valResult.array());
  }

  try {
    const partyData = await createNewParty({
      name,
      endTime,
      hostUserId,
      hostDisplayName,
    });

    res.status(201).json(partyData);
  } catch (e) {
    res.status(500).send("Server Error");
  }
};
