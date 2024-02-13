import express, { json, Request, Response } from 'express'
import {signup} from "./controllers/signup";
import {login} from "./controllers/login";
import {updateAccount} from "./controllers/updateAccount";
import {isUserHome} from "./controllers/isUserHome";

const app = express();
const port = 3000;

app.use(json())

app.post('/api/signup', signup);
app.post('/api/login', login);
app.put('/api/updateAccount', updateAccount);
app.get('/api/isUserHome', isUserHome);

app.listen(port, () => {
    console.log(`User service listening on port ${port}`);
});