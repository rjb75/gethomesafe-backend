import express, { json, Request, Response } from 'express'
import 'dotenv/config'
import {signup} from "./controllers/signup";
import {updateAccount} from "./controllers/updateAccount";
import {isUserHome} from "./controllers/isUserHome";
import {signupValidationSchema} from "./validators/signupValidation";
import {isUserHomeValidatorSchema} from "./validators/isUserHomeValidation";
import {updateAccountValidationSchema} from "./validators/updateAccountValidator";
import {getUserInfoValidationSchema} from "./validators/getUserInfoValidation";
import {getUserInfo} from "./controllers/getUserInfo";
import {healthCheck} from "./sync/healthCheck";
import {initiateElection} from "./sync/election";
import store from "./sync/store";
import {syncDB} from "./sync/syncDB";

const app = express();
const port = 3000;

if (!process.env.ID) process.exit(1);
else store.getInstance().setId(Number(process.env.ID))

if (!process.env.HOSTNAME) process.exit(1);
else store.getInstance().setHostname(process.env.HOSTNAME)

if (!process.env.USER_SERVICE_HOSTS) process.exit(1);
else store.getInstance().setHosts(process.env.USER_SERVICE_HOSTS.split(','))

app.use(json())

app.post('/api/signup', signupValidationSchema, signup);
app.put('/api/updateAccount', updateAccountValidationSchema, updateAccount);
app.get('/api/isUserHome', isUserHomeValidatorSchema, isUserHome);
app.get('/api/getUserInfo', getUserInfoValidationSchema, getUserInfo);

app.get("/api/heartbeat", (req: Request, res: Response) => res.status(200).header('X-Primary-Host', store.getInstance().getLeaderHostname()).send());
app.get("/api/election", (req: Request, res: Response) => {
    console.log("received election message");
    const peer_id = req.get("id");
    if (Number(peer_id) < Number(store.getInstance().getId())) {
        res.status(200).send() // Bully
        if (!store.getInstance().getRunning()) {
            initiateElection();
        }
    }
});
app.get("/api/leader", (req: Request, res: Response) => {
    console.log(`received leader message: ${req.get('leaderHostname')}`)
    store.getInstance().setLeaderHostname(req.get('leaderHostname') || undefined);
    store.getInstance().setRunning(false);
    res.status(200).send();
});

syncDB().then(() => {
    app.listen(port, async () => {

    console.log(`User service listening on port ${port}`);

    setInterval(() => {
        const leaderHostname = store.getInstance().getLeaderHostname();
        if (!leaderHostname) {
            console.log("No current leader")
            initiateElection()
        } else {
            console.log(`Current Leader: ${leaderHostname}`)
            if (Number(leaderHostname.split('-')[2]) !== store.getInstance().getId()) {
                healthCheck(leaderHostname).on("error", (err) => {
                    console.log("Healthcheck failed")
                    initiateElection()
                })
            }
        }
    }, 5000)
    });
})