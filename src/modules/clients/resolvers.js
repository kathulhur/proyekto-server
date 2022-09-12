import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from '../_utils/authResolvers';



const resolvers = {
    Query: {
        clients: combineResolvers(
            isAuthenticated,
            async (_, __, { models, authenticatedUser }) => await models.Client.find({ userId: authenticatedUser.id }),
        ),
        client: combineResolvers(
            isAuthenticated,
            async (_, args, { models }) => await models.Client.findById(args.id)
        ),
    },
    Mutation: {
        createClient: combineResolvers(
            isAuthenticated,
            async (parent, { name, email, phone }, { models, authenticatedUser }) => {
            const client = new models.Client({
                name:name,
                email: email,
                phone: phone,
                userId: authenticatedUser.id
            });
            await client.save();
            return client;
        }),
        updateClient: combineResolvers(
            isAuthenticated,
            async (_, { id, name, email, phone }, { models }) => {
            const client = await models.Client.findByIdAndUpdate(id, {
                name: name,
                email: email,
                phone: phone
            }); 

            return client;
        }),
        deleteClient: combineResolvers(
            isAuthenticated,
            async (_, args, { models }) => {
            const client = await models.Client.findById(args.id);
            await models.Project.deleteMany({ clientId: args.id });
            await client.remove();
            return client;
        }),
    }
}




export default resolvers;