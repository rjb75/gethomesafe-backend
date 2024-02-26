import { ObjectId } from "mongodb";

export interface Party {
  _id: ObjectId;
  name: string;
  hostUserId: string;
  inviteCode: string;
  qrCode: string;
  active: boolean;
  members: User[];
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  displayName: string;
  address: Address;
}

export interface Address {
  coordinates: Coordinates;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export interface Coordinates {
  lat: number;
  long: number;
}
