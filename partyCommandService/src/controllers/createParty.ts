import { Request, Response } from "express";

export const createParty = (req: Request, res: Response) => {
  res.send("Hello createParty");
};
