import {Request, Response} from "express";
import {createUser} from "../services/createUser";
import {User} from "../models/User";

export const signup = (req: Request, res: Response) => {
    const user: User = req.body;

    createUser(user).then(r => {
        res.status(200).send("User Created");
    }).catch(e => {
        res.status(500).send(e.message);
    })
}