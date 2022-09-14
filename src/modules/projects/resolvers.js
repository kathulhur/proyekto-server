import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from '../_utils/authResolvers';

const resolvers = {
    Project: {
        client: async ({ clientId }, _, { models }) => {
            const client = await models.Client.findById(clientId);
            return client;
        }
    },
    Query: {
        projects: combineResolvers(
            isAuthenticated,
            async (_, __, { models, authenticatedUser }) => await models.Project.find({ userId: authenticatedUser.id })
        ),
        project: combineResolvers(
            isAuthenticated,
            async (_, { id }, { models }) => await models.Project.findById(id)
        )
    },
    Mutation: {
        createProject: combineResolvers(
            isAuthenticated,
            async (_, { clientId, name, description, status }, { models, authenticatedUser }) => {
            const project = new models.Project({
                clientId: clientId,
                name: name,
                description: description,
                status: status,
                userId: authenticatedUser.id
            });
            await project.save();
            return project;
        }),
        updateProject: combineResolvers(
            isAuthenticated,
            async (_, { id, clientId, name, description, status }, { models }) => {
            const project = await models.Project.findByIdAndUpdate(id, { $set: {
                clientId: clientId,
                name: name,
                description: description,
                status: status
            }}, { new: true });


            return project;
        }),
        deleteProject: combineResolvers(
            isAuthenticated,
            async (_, { id }, { models }) => {
            const project = await models.Project.findById(id);
            await project.remove();
            return project;
        }),
    }
};




export default resolvers;