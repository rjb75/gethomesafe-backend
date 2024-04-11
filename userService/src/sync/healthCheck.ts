import { get } from "http";

/* Send health check to id */
export const healthCheck = (hostname: string) => {
    console.log("Started Healthcheck")
    const options = {
        timeout: 3000,
        hostname: hostname,
        port: 3000,
        path: '/api/heartbeat'
    }

    return get(options)
}