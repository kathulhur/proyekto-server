import { Clients, Users, Projects } from "../modules"

export interface Response{
    code: number
    success: boolean
    message: string
}


export interface DataSources {
    users: Users
    projects: Projects
    clients: Clients
}