import express, { json, Request, Response } from 'express'
import 'dotenv/config'
import {partyInvite} from "./controllers/partyInvite";
import {parties} from "./controllers/parties";
import {partyStatus} from "./controllers/partyStatus";
import {partyInviteValidationSchema} from "./validators/partyInviteValidation";
import {partyStatusValidationSchema} from "./validators/partyStatusValidation";
import {partiesValidationSchema} from "./validators/partiesValidation";

const app = express();
const port = 4000;

app.use(json())

app.get('/api/partyInvite', partyInviteValidationSchema, partyInvite);
app.get('/api/parties', partiesValidationSchema, parties);
app.get('/api/partyStatus', partyStatusValidationSchema, partyStatus);

app.listen(port, () => {
    console.log(`Party query service listening on port ${port}`);
});