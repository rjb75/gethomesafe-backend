import store from "./store";
import * as http from "http";
import { Request } from "express";


export const updateReplicas = (req: Request, newBody?: any) => {
    const hosts = store.getInstance().getHosts()

    for (let i = 0; i < hosts.length; i++) {
        const body = JSON.stringify(newBody ? newBody : req.body);
        let options = {
            method: req.method,
            path: req.path,
            port: 3000,
            hostname: hosts[i],
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
                "X-User-Id": req.get("X-User-Id") ? req.get("X-User-Id") : '',
                "X-Gateway-Leader": req.get('X-Gateway-Leader') ? req.get('X-Gateway-Leader') : '',
            }
        }
        const r = http.request(options).on("response", (response) => console.log(response.statusCode)).on("error", () => {})
        r.end(body)
    }
}