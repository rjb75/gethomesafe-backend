import {Request, Response} from "express";
import {User} from "../models/User";
import {validationResult} from "express-validator";
import {getUser} from "../services/getUser";

interface expectedQuery {
    _id: string,
}

export const getUserInfo = (req: Request<{},{},{}, expectedQuery>, res: Response) => {
    const valResult = validationResult(req);
    if (!valResult.isEmpty()) {
        return res.status(300).send(valResult.array());
    }

    const { _id } = req.query;

    getUser(_id).then((user: User) => {
        res.status(200).send(user);
    }).catch(e => {
        res.status(500).send(e.message);
    })
}