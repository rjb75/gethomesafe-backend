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

export const updateAccountValidationSchema = checkSchema({
    '_id': {
        notEmpty: { bail: true },
        isString: { bail: true },
        custom: {
            options: doesUserExist,
        }
    },
    'displayName': { optional: true, notEmpty: { bail: true }, isString: { bail: true } },
    'address.coordinates.lat': {
        optional: true,
        notEmpty: { bail: true },
        isFloat: { bail: true },
        customSanitizer: {
            options: coordinateSanitizer,
        }
    },
    'address.coordinates.long': {
        optional: true,
        notEmpty: { bail: true },
        isFloat: { bail: true },
        customSanitizer: {
            options: coordinateSanitizer,
        }
    },
    'address.street': { optional: true, isString: { bail: true } },
    'address.city': { optional: true, isString: { bail: true } },
    'address.province': { optional: true, isString: { bail: true } },
    'address.postalCode': { optional: true, isString: { bail: true } },
})