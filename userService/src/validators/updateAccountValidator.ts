import {dbClient} from "../models/mongo";
import {User} from "../models/User";
import {checkSchema} from "express-validator";

const coordinateSanitizer = (value: any) => {
    return Number.parseFloat(value);
}

export const updateAccountValidationSchema = checkSchema({
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