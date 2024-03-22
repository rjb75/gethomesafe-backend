import store from "./store";
import * as http from "http";
import { Request } from "express";


export const updateReplicas = (req: Request, newBody?: any) => {
    const hosts = store.getInstance().getHosts()

    console.log(hosts)

    for (let i = 0; i < hosts.length; i++) {
        const body = JSON.stringify(newBody ? newBody : req.body);
        let options = {
            method: req.method,
            path: req.path,
            port: 3000,
            hostname: hosts[i],
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body)
            }
        }
        const r = http.request(options).on("response", (response) => console.log(response.statusCode)).on("error", () => {})
        r.end(body)
    }
}