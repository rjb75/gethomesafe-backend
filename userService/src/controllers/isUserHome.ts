import {Request, Response} from "express";
import {getUser} from "../services/getUser";
import {distanceBetweenCoordinates} from "../services/distanceBetweenCoordinates";
import {validationResult} from "express-validator";

interface expectedQuery {
    _id: string,
    currentLat: number,
    currentLong: number
}

export const isUserHome = async (req: Request<{},{},{}, expectedQuery>, res: Response) => {
    const valResult = validationResult(req);
    if (!valResult.isEmpty()) {
        return res.status(300).send(valResult.array());
    }

    const {_id, currentLat, currentLong} = req.query;

    try{
        const user = await getUser(_id);
        const {lat: homeLat, long: homeLong} = user.address.coordinates;

        const distance = distanceBetweenCoordinates(homeLat, homeLong, currentLat, currentLong);
        res.status(200).send({isUserHome: distance < 30});
    } catch (e) {
        res.status(500).send("Server Error");
    }
}