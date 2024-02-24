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
    if (user) throw new Error("Duplicate id");
}

export const signupValidationSchema = checkSchema({
    'displayName': { notEmpty: { bail: true }, isString: { bail: true } },
    'email': { notEmpty: { bail: true }, isEmail: { bail: true } },
    'password': { notEmpty: { bail: true }, isString: { bail: true } },
    'address.coordinates.lat': {
        notEmpty: { bail: true },
        isFloat: { bail: true },
        customSanitizer: {
            options: coordinateSanitizer,
        }
    },
    'address.coordinates.long': {
        notEmpty: { bail: true },
        isFloat: { bail: true },
        customSanitizer: {
            options: coordinateSanitizer,
        }
    },
    'address.street': { isString: { bail: true } },
    'address.city': { isString: { bail: true } },
    'address.province': { isString: { bail: true } },
    'address.postalCode': { isString: { bail: true } },
})