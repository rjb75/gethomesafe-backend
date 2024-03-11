import { checkSchema } from "express-validator";

export const partyInviteValidationSchema = checkSchema({
  inviteCode: {
    in: ["query"],
    isString: true,
    isLength: {
      options: { min: 36, max: 36 },
    },
    errorMessage: "Party code must be a string with length of 36",
  },
});
