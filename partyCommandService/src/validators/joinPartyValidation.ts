import { checkSchema } from "express-validator";
import { inviteCodeSanitizer } from "../lib/sanitizer";

export const joinPartyValidationSchema = checkSchema({
  userId: {
    in: ["body"],
    isString: true,
    isLength: {
      options: { min: 1, max: 255 },
    },
    errorMessage: "Host user ID must be a string with length between 1 and 255",
  },
  inviteCode: {
    in: ["body"],
    isString: true,
    isLength: {
      options: { min: 6, max: 6 },
    },
    customSanitizer: {
      options: inviteCodeSanitizer,
    },
    errorMessage: "Invite code must be a string with length of 6",
  },
});
