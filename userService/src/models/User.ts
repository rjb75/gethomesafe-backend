
export interface User {
    _id: string,
    displayName: string,
    address: Address,
}

export interface Address {
    coordinates: Coordinates,
    street: string,
    city: string,
    province: string,
    postalCode: string,
}

export interface Coordinates {
    lat: number;
    long: number;
}