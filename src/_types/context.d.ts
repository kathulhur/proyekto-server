import { DataSources } from "./common"
import { AuthPayload } from "./users"

export interface Context{
    dataSources: DataSources
    authenticatedUser?: AuthPayload | null
    secret?: string
    models: any
}