import { Document, ObjectId } from "mongoose";

export interface Project {
    id?: ObjectId;
    name?: string;
    description?: string;
    status?: string;
    clientId?: ObjectId;
    userId?: ObjectId;

}

export type ProjectDocument = Project & Document


export interface ProjectArgs {
    id: string;
}


export interface CreateProjectArgs {
    name: string;
    description: string;
    status: string;
    clientId: ObjectId;

}

export interface UpdateProjectArgs {
    id: string;
    name?: string;
    description?: string;
    status?: string;
    clientId?: string;
}

export interface DeleteProjectArgs {
    id: string;
}