import {checkSchema} from "express-validator";

export const getUserInfoValidationSchema = checkSchema({
    '_id': {
        notEmpty: { bail: true },
        isString: { bail: true },
    }
})