import {Request, Response} from "express";
import {getUser} from "../services/getUser";
import {distanceBetweenCoordinates} from "../services/distanceBetweenCoordinates";

interface expectedQuery {
    _id: string,
    currentLat: number,
    currentLong: number
}

export const isUserHome = async (req: Request<{},{},{}, expectedQuery>, res: Response) => {
    const {_id, currentLat, currentLong} = req.query;

    if (!_id || !currentLat || !currentLong) {
        res.status(400).send("Not enough args");
        return;
    }

    try{
        const user = await getUser(_id);
        const {lat: homeLat, long: homeLong} = user.address.coordinates;

        const distance = distanceBetweenCoordinates(homeLat, homeLong, currentLat, currentLong);
        console.log(distance)
        res.status(200).send({isUserHome: distance < 30});
    } catch (e) {
        res.status(500).send("Server Error");
    }
}