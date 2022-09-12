import { skip } from 'graphql-resolvers';
import { ApolloError, ForbiddenError } from 'apollo-server-express';

export const isAuthenticated = (_, __, { authenticatedUser }) => {
    console.log('resolver: isAuthenticated')
    console.log(authenticatedUser)
    return authenticatedUser ? skip : new ForbiddenError('Not authenticated as user.');
}

export const isAdmin = (_, __, { authenticatedUser }) => {
    console.log('resolver: isAdmin')
    console.log(authenticatedUser)
    return authenticatedUser && authenticatedUser.role === 'ADMIN' ? skip : new ForbiddenError('Not authenticated as admin.');
}