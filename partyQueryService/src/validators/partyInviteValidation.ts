import { checkSchema } from "express-validator";

export const partyInviteValidationSchema = checkSchema({
  partyId: {
    in: ["query"],
    isString: true,
    isLength: {
      options: { min: 1, max: 255 },
    },
    errorMessage: "partyId must be a string with length between 1 and 255",
  },
});
