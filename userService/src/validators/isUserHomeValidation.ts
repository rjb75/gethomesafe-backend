import {dbClient} from "../models/mongo";
import {User} from "../models/User";
import {checkSchema} from "express-validator";

const coordinateSanitizer = (value: any) => {
    return Number.parseFloat(value);
}

const doesUserExist = async (value: any) => {
    const database = dbClient.getClient();
    const collection = database.collection<User>("users");
    const user = await collection.findOne({_id: value});
    if (!user) throw new Error("User Doesn't Exist");
}

export const isUserHomeValidatorSchema = checkSchema({
    '_id': {
        notEmpty: { bail: true },
        isString: { bail: true },
        custom: {
            options: doesUserExist,
        }
    },
    'currentLat': {
        notEmpty: { bail: true },
        isFloat: { bail: true },
        customSanitizer: {
            options: coordinateSanitizer,
        }
    },
    'currentLong': {
        notEmpty: { bail: true },
        isFloat: { bail: true },
        customSanitizer: {
            options: coordinateSanitizer,
        }
    }
})