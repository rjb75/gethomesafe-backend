import { get } from "http";

/* Send health check to id */
export const healthCheck = (hostname: string): boolean => {
    const options = {
        timeout: 3000,
        hostname: hostname,
        port: 3000,
        path: '/api/heartbeat'
    }

    get(options, res => {
        return res.statusCode === 200;
    }).on('timeout', () => {
        return false;
    })
    return false;
}