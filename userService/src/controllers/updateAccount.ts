import {Request, Response} from "express";
import {User} from "../models/User";
import {updateUser} from "../services/updateUser";
import {validationResult} from "express-validator";
import {updateReplicas} from "../sync/updateReplicas";
import store from "../sync/store";

export const updateAccount = (req: Request, res: Response) => {
    const syncStore = store.getInstance()
    const valResult = validationResult(req);
    if (!valResult.isEmpty()) {
        return res.status(300).send(valResult.array());
    }

    const user: User = req.body;
    const _id = req.get("X-User-Id");
    if (!_id) {
        res.status(500).send("No user id provided");
        return;
    }

    updateUser(_id, user.displayName, user.address).then(r => {
        res.status(200).send("User Updated");
        if (syncStore.isLeader()) updateReplicas(req)
    }).catch(e => {
        res.status(500).send(e.message);
    })
}