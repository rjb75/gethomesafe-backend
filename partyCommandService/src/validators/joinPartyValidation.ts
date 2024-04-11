import { checkSchema } from "express-validator";

export const joinPartyValidationSchema = checkSchema({
  inviteCode: {
    in: ["body"],
    isString: true,
    isLength: {
      options: { min: 6, max: 6 },
    },
    errorMessage: "Invite code must be a string with length of 6",
  },
  userDisplayName: {
    in: ["body"],
    isString: true,
    isLength: {
      options: { min: 1, max: 255 },
    },
    errorMessage:
      "User display name must be a string with length between 1 and 255",
  },
});
