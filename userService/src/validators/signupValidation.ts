import {dbClient} from "../models/mongo";
import {User} from "../models/User";
import {checkSchema} from "express-validator";

const coordinateSanitizer = (value: any) => {
    return Number.parseFloat(value);
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