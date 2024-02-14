import {Request, Response} from "express";
import {createUser} from "../services/createUser";
import {User} from "../models/User";

export const signup = (req: Request, res: Response) => {
    const { _id, displayName, address }: User = req.body;

    createUser({_id, displayName, address}).then(r => {
        res.status(200).send("User Created");
    }).catch(e => {
        res.status(500).send(e);
    })
}