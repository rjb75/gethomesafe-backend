import { dbClient } from '../models/mongo'
import {Address, User} from "../models/User";

export const updateUser = async (_id: string, displayName?: string, address?: Address): Promise<boolean> => {
    const database = dbClient.getClient();

    const collection = database.collection<User>("users");
    const user = await collection.findOne({_id: _id});

    if (!user) {
        throw new Error("User Doesn't Exist");
    }

    const update = {
        $set: {
            displayName: displayName ? displayName : user.displayName,
            address: address ? address : user.address,
        }
    }

    const result = await collection.updateOne({_id: _id}, update)
    return result.acknowledged;
}