import {Request, Response} from "express";

export const parties = (req: Request, res: Response) => {
    res.send("Hello parties");
}