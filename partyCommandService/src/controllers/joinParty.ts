import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { addMemberToParty } from "../services/joinParty";

export interface JoinPartyRequestBody {
  inviteCode: string;
  userId: string;
  userDisplayName: string;
}

export const joinParty = async (
  req: Request<{}, {}, JoinPartyRequestBody, {}>,
  res: Response
) => {
  const { inviteCode, userId, userDisplayName } = req.body;

  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(300).send(valResult.array());
  }

  try {
    const updatedParty = await addMemberToParty({
      inviteCode,
      userId,
      userDisplayName,
    });

    res.status(200).json(updatedParty);
  } catch (e) {
    res.status(500).send("Server Error");
  }
};
