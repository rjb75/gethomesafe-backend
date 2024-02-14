import {Request, Response} from "express";
import {User} from "../models/User";
import {updateUser} from "../services/updateUser";

export const updateAccount = (req: Request, res: Response) => {
    const user: User = req.body;

    updateUser(user._id, user.displayName, user.address).then(r => {
        res.status(200).send("User Updated");
    }).catch(e => {
        res.status(500).send(e.message);
    })
}