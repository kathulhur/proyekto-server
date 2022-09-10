import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { skip } from 'graphql-resolvers';
import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers } from 'graphql-resolvers';


const isAuthenticated = (parent, args, { user }) => {
    return user ? skip : new ForbiddenError('Not authenticated as user.');
}

const resolvers = {
    Query: {
        clients: combineResolvers(
            isAuthenticated,
            async (parent, args, { models, user }) => await models.Client.find({ userId: user.id }),
        ),
        client: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => await models.Client.findById(args.id)
        ),
    },
    Mutation: {
        createClient: combineResolvers(
            isAuthenticated,
            async (parent, args, { models, user}) => {
            const client = new models.Client({
                name: args.name,
                email: args.email,
                phone: args.phone,
                userId: user.id
            });
            await client.save();
            return client;
        }),
        editClient: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const client = await models.Client.findByIdAndUpdate(args.id, {
                name: args.name,
                email: args.email,
                phone: args.phone
            }); 

            return client;
        }),
        deleteClient: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const client = await models.Client.findById(args.id);
            await models.Project.deleteMany({ clientId: args.id });
            await client.remove();
            return client;
        }),
    }
}




export default resolvers;