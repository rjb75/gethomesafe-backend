import {Request, Response} from "express";

export const isUserHome = (req: Request, res: Response) => {
    res.send('Hello World');
}