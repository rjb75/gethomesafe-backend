import {Request, Response} from "express";
import {createUser} from "../services/createUser";
import {User} from "../models/User";
import {validationResult} from "express-validator";

export const signup = (req: Request, res: Response) => {
    const valResult = validationResult(req);
    if (!valResult.isEmpty()) {
        return res.status(300).send(valResult.array());
    }

    const user: User = req.body;

    createUser(user).then(r => {
        res.status(200).send("User Created");
    }).catch(e => {
        res.status(500).send(e.message);
    })
}