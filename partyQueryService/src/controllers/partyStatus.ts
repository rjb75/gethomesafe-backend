import {Request, Response} from "express";

export const partyStatus = async (req: Request, res: Response) => {
    res.send("Hello party status");
}