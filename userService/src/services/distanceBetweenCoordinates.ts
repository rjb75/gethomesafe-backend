export const distanceBetweenCoordinates = (lat1: number, long1: number, lat2: number, long2: number): number => {
    const earthRadius = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2-lat1);  // deg2rad below
    const dLon = deg2rad(long2-long1);
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    const b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return earthRadius * b * 1000; // Distance in m
}

function deg2rad(deg: number) {
    return deg * (Math.PI/180)
}