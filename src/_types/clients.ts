import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
export interface Client {
    id?: ObjectId;
    name?: string;
    email?: string;
    phone?: string;
    userId?: ObjectId
}

export type ClientDocument = Client & Document

export interface ClientArgs {
    id: string | ObjectId
}

export interface CreateClientArgs {
    name: string;
    email: string;
    phone: string;

}

export interface UpdateClientArgs {
    id: ObjectId;
    name?: string;
    email?: string;
    phone?: string;

}

export interface DeleteClientArgs {
    id: string;
}

