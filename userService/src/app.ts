import express, { json, Request, Response } from 'express'
import 'dotenv/config'
import {signup} from "./controllers/signup";
import {updateAccount} from "./controllers/updateAccount";
import {isUserHome} from "./controllers/isUserHome";

const app = express();
const port = 3000;

app.use(json())

app.post('/api/signup', signup);
app.put('/api/updateAccount', updateAccount);
app.get('/api/isUserHome', isUserHome);

app.listen(port, () => {
    console.log(`User service listening on port ${port}`);
});