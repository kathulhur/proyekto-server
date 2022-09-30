import { DataSources } from "./common"
import { User } from "./users"

export interface Context{
    dataSources: DataSources
    models?: any
    authenticatedUser?: User
    secret?: string
}