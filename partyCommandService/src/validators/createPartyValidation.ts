import { checkSchema } from "express-validator";
import { nameSanitizer } from "../lib/sanitizer";

export const createPartyValidationSchema = checkSchema({
  name: {
    in: ["body"],
    isString: true,
    isLength: {
      options: { min: 1, max: 255 },
    },
    customSanitizer: {
      options: nameSanitizer,
    },
    errorMessage: "Name must be a string with length between 1 and 255",
  },
  endTime: {
    in: ["body"],
    isISO8601: true,
    errorMessage: "End time must be a valid ISO8601 date",
  },
  hostUserId: {
    in: ["body"],
    isString: true,
    isLength: {
      options: { min: 1, max: 255 },
    },
    errorMessage: "Host user ID must be a string with length between 1 and 255",
  },
  hostDisplayName: {
    in: ["body"],
    isString: true,
    isLength: {
      options: { min: 1, max: 255 },
    },
    customSanitizer: {
      options: nameSanitizer,
    },
    errorMessage:
      "Host display name must be a string with length between 1 and 255",
  },
});
