import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { getPartyStatus } from "../services/queries";

export interface partyStatusRequestQuery {
  partyId: string;
}

export const partyStatus = async (
  req: Request<{}, {}, {}, partyStatusRequestQuery>,
  res: Response
) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(300).send(valResult.array());
  }
  const partyId = req.query.partyId;

  try {
    const partyData = await getPartyStatus(partyId);
    if (!partyData) {
      return res.status(404).send("Invalid invite code - Party not found");
    }
    res.status(200).json(partyData);
  } catch (e) {
    res.status(500).send("Server Error");
  }
};
