import SyncStore from "./store";
import {fetchWithTimeout} from "./fetchWithTimeOut";

/* Initiate an election */
export const initiateElection = async () => {
    const store = SyncStore.getInstance();
    if (store.getRunning()) {
        console.log('election already running.');
        return;
    }

    console.log("Election initiated")
    store.setRunning(true);
    let biggerHosts = store.getHosts().filter((host) => Number(host.split('-')[2]) > store.getId());

    console.log(`Bigger Hosts: ${biggerHosts}`)

    if (biggerHosts.length === 0) {
        let responses: Promise<Response>[] = [];
        store.getHosts().forEach((host) => {
            responses.push(fetch(`http://${host}:3000/api/leader`, {headers:{'leaderHostname': store.getHostname()}}));
        })
        Promise.all(responses).catch((error) => console.log(error))
        store.setLeaderHostname(store.getHostname());
        store.setRunning(false);
    } else {
        let responses: Promise<Response>[] = [];
        let electionWon = true;
        biggerHosts.forEach((host) => {
            console.log(`sending election msg to: ${host}`)
            fetchWithTimeout(`http://${host}:3000/api/election`, 5000).then((res) => {
                console.log(`election responses: ${res.status}`)
                electionWon = false;
            }).catch(err => console.log(`Some election error: ${err}`))
        })

        setTimeout(() => {
            console.log(`election results: ${electionWon}`);
            if (electionWon) { // Timeout no responses
                store.setLeaderHostname(store.getHostname());
                store.setRunning(false);
                const hosts = store.getHosts();
                let responses: Promise<Response>[] = [];
                hosts.forEach((host) => {
                    responses.push(fetch(`http://${host}:3000/api/leader`, {headers:{'leaderHostname': store.getHostname()}}));
                })
                Promise.all(responses).catch((error) => console.log(`Error 47: ${error}`))
            }
        }, 6000)
    }

}