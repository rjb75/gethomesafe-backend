import SyncStore from "./store";
import * as http from "http";

/* Initiate an election */
export const initiateElection = () => {
    const store = SyncStore.getInstance();
    store.setRunning(true);
    let biggerHosts = store.getHosts().filter((host) => Number(host.split('-')[2]) > store.getId());

    if (biggerHosts.length === 0) {
        let responses: Promise<Response>[] = [];
        store.getHosts().forEach((host) => {
            responses.push(fetch(`http://${host}:3000/api/leader`));
        })
        fetch('http://gateway:8080/api/setUserServicePrimary');
    } else {
        let responses: Promise<Response>[] = [];
        let electionWon = true;
        biggerHosts.forEach((host) => {
            responses.push(fetchWithTimeout(`http://${host}:3000/api/election?id=${store.getId()}`, 3000));
        })
        Promise.race(responses).then((res) => {
            if (res.status === 200) electionWon = false;
        })

        setTimeout(() => {
            if (electionWon) { // Timeout no responses
                store.setLeaderHostname(store.getHostname())
                const hosts = store.getHosts();
                let responses: Promise<Response>[] = [];
                hosts.forEach((host) => {
                    responses.push(fetch(`http://${host}:3000/api/leader`));
                })
                fetch('http://gateway:8080/api/setUserServicePrimary');
            }
        }, 4000)
    }

}