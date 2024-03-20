

async function fetchWithTimeout(resource: string, timeout: number = 3000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        signal: controller.signal
    });
    clearTimeout(id);

    return response;
}