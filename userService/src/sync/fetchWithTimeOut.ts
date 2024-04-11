import store from "./store";

export async function fetchWithTimeout(resource: string, timeout: number = 3000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        method: "GET",
        headers: {
          "id": String(store.getInstance().getId()),
        },
        signal: controller.signal
    });
    clearTimeout(id);

    return response;
}