import {Request, Response} from "express";
import {User} from "../models/User";
import {validationResult} from "express-validator";
import {getUser} from "../services/getUser";

export const getUserInfo = (req: Request, res: Response) => {
    console.log("gateway thinks leader is", req.headers['x-gateway-leader'])

    const valResult = validationResult(req);
    if (!valResult.isEmpty()) {
        return res.status(300).send(valResult.array());
    }

    const _id = req.get("X-User-Id");
    if (!_id) {
        res.status(500).send("No user id provided");
        return;
    }

    getUser(_id).then((user: User) => {
        res.status(200).send(user);
    }).catch(e => {
        res.status(500).send(e.message);
    })
}