import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { getParties } from "../services/queries";

export const parties = async (req: Request, res: Response) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(300).send(valResult.array());
  }

  try {
    const partyData = await getParties();

    res.status(200).json(partyData);
  } catch (e) {
    res.status(500).send("Server Error");
  }
};
