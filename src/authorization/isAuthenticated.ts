import { rule } from 'graphql-shield'
import { ForbiddenError } from 'apollo-server-core'
import { Context } from '../_types/context'


export const isAuthenticated = rule()(async (parent:any, args: any, { authenticatedUser }: Context) => {
    return authenticatedUser ? true : new ForbiddenError('Not authenticated.');
})