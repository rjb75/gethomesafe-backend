import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { getPartyByInviteCode } from "../services/queries";

export interface partyInviteRequestQuery {
  inviteCode: string;
}

export const partyInvite = async (
  req: Request<{}, {}, {}, partyInviteRequestQuery>,
  res: Response
) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(300).send(valResult.array());
  }
  const inviteCode = req.query.inviteCode;
  try {
    const partyData = await getPartyByInviteCode(inviteCode);
    if (!partyData) {
      return res.status(404).send("Invalid invite code - Party not found");
    }
    res.status(200).json(partyData);
  } catch (e) {
    res.status(500).send("Server Error");
  }
};
