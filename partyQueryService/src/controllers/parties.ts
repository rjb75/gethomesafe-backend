import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { getUserParties } from "../services/queries";

export const parties = async (req: Request, res: Response) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(300).send(valResult.array());
  }

  const userId = req.get("X-User-Id");
  if (!userId) {
    res.status(500).send("No user id provided");
    return;
  }

  try {
    const partyData = await getUserParties(userId);

    res.status(200).json(partyData);
  } catch (e) {
    res.status(500).send("Server Error");
  }
};
