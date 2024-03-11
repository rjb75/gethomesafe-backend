import { checkSchema } from "express-validator";

export const partyStatusValidationSchema = checkSchema({
  partyId: {
    in: ["query"],
    isLength: {
      options: { min: 1, max: 255 },
    },
    errorMessage: "partyId must be a string with length between 1 and 255",
  },
});
