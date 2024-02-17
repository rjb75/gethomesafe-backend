import { dbClient } from '../models/mongo'
import {User} from "../models/User";

export const createUser = async (user: User): Promise<boolean> => {
    const database = dbClient.getClient();

    const collection = database.collection<User>("users");
    const result = await collection.insertOne(user);
    return result.acknowledged;
}