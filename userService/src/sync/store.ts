

class SyncStore {
    private static instance: SyncStore
    private leaderHostname: string | undefined
    private running: boolean
    private hosts: string[]
    private id: number
    private hostname: string


    private constructor() {
        this.leaderHostname = undefined
        this.running = false
        this.hosts = [];
        this.id = -1;
        this.hostname = ""
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

    static getInstance(): SyncStore {
        if (!SyncStore.instance) {
            SyncStore.instance = new SyncStore();
        }
        return SyncStore.instance
    }

}

export default SyncStore