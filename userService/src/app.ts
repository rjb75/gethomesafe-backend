import express, { json, Request, Response } from 'express'
import 'dotenv/config'
import {signup} from "./controllers/signup";
import {updateAccount} from "./controllers/updateAccount";
import {isUserHome} from "./controllers/isUserHome";
import {signupValidationSchema} from "./validators/signupValidation";
import {isUserHomeValidatorSchema} from "./validators/isUserHomeValidation";
import {updateAccountValidationSchema} from "./validators/updateAccountValidator";

const app = express();
const port = 3000;

app.use(json())

app.post('/api/signup', signupValidationSchema, signup);
app.put('/api/updateAccount', updateAccountValidationSchema, updateAccount);
app.get('/api/isUserHome', isUserHomeValidatorSchema, isUserHome);

app.listen(port, () => {
    console.log(`User service listening on port ${port}`);
});