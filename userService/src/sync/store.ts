import {read} from "node:fs";
import {User} from "../models/User";
import {createUser} from "../services/createUser";
import {updateUser} from "../services/updateUser";


class SyncStore {
    private static instance: SyncStore
    private leaderHostname: string | undefined
    private running: boolean
    private hosts: string[]
    private id: number
    private hostname: string
    private dbReady: boolean
    private signupQueue: User[]
    private updateQueue: User[]

    private constructor() {
        this.leaderHostname = undefined;
        this.running = false;
        this.hosts = [];
        this.id = -1;
        this.hostname = "";
        this.dbReady = false;
        this.signupQueue = [];
        this.updateQueue = [];
    }

    pushToSignupQueue(user: User) {
        this.signupQueue.push(user);
    }

    pushToUpdateQueue(user: User) {
        this.updateQueue.push(user);
    }

    isDBReady() {
        return this.dbReady;
    }

    setDBReady(ready: boolean) {
        this.dbReady = ready;
    }

    setHostname(hostname: string) {
        this.hostname = hostname;
    }

    getHostname(): string {
        return this.hostname;
    }

    setRunning(val: boolean) {
        this.running = val;
    }

    getId(): number {
        return this.id;
    }

    setId(id: number) {
        this.id = id
    }

    getRunning(): boolean {
        return this.running;
    }

    isLeader(): boolean {
        if (this.leaderHostname === undefined) return false;
        return this.id === Number(this.leaderHostname.split('-')[2])
    }

    getHosts(): string[] {
        return this.hosts.filter((host) => Number(host.split('-')[2]) !== this.id);
    }

    setHosts(hosts: string[]) {
        this.hosts = hosts
    }

    getLeaderHostname() {
        return this.leaderHostname;
    }

    setLeaderHostname(hostname: string | undefined) {
        this.leaderHostname = hostname;
    }

    async applyQueueUpdates() {
        while (this.signupQueue.length > 0 || this.updateQueue.length > 0) {
            if (this.signupQueue.length !== 0) {
                // @ts-ignore
                await createUser(this.signupQueue.shift());
            } else {
                const user = this.updateQueue.shift();
                // @ts-ignore
                await updateUser(user._id, user?.displayName, user?.address);
            }
        }
    }

    static getInstance(): SyncStore {
        if (!SyncStore.instance) {
            SyncStore.instance = new SyncStore();
        }
        return SyncStore.instance
    }

}

export default SyncStore