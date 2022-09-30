import { skip } from 'graphql-resolvers';
import { ApolloError, ForbiddenError } from 'apollo-server-express';
import { Context } from '../../_types/context';
export const isAuthenticated = (_: undefined, __: undefined , { authenticatedUser }: Context): ForbiddenError | undefined => {
    console.log('resolver: isAuthenticated')
    console.log(authenticatedUser)
    return authenticatedUser ? skip : new ForbiddenError('Not authenticated as user.');
}
export const isAdmin = (_: undefined, __: undefined, { authenticatedUser }: Context) => {
    console.log('resolver: isAdmin')
    console.log(authenticatedUser)
    return authenticatedUser && authenticatedUser.role === 'ADMIN' ? skip : new ForbiddenError('Not authenticated as admin.');
}