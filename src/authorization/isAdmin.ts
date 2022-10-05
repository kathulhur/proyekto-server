import { ForbiddenError } from "apollo-server-core"
import { rule } from "graphql-shield"
import { Context } from "../_types/context"



export const isAdmin = rule()(async (parent:any, args: any, { authenticatedUser }: Context) => {
    return authenticatedUser && authenticatedUser.role === 'ADMIN' ? true : new ForbiddenError('Not authenticated as Admin')
})