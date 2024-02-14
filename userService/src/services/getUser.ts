import { dbClient } from '../models/mongo'
import {Address, User} from "../models/User";

export const getUser = async (_id: string): Promise<User> => {
    const database = dbClient.getClient();

    const collection = database.collection<User>("users");
    const user = await collection.findOne({_id: _id});

    if (!user) {
        throw new Error("User Doesn't Exist");
    }

    return user;
}