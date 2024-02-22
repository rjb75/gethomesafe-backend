import express, { json } from "express";
import "dotenv/config";
import { createPartyValidationSchema } from "./validators/createPartyValidation";
import { createParty } from "./controllers/createParty";
import { joinPartyValidationSchema } from "./validators/joinPartyValidation";
import { joinParty } from "./controllers/joinParty";

const app = express();
const port = 5000;

app.use(json());

app.get("/api/create-party", createPartyValidationSchema, createParty);
app.get("/api/join-party", joinPartyValidationSchema, joinParty);

app.listen(port, () => {
  console.log(`Party Command Service listening on port ${port}`);
});
