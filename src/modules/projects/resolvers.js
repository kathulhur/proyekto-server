import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { skip } from 'graphql-resolvers';
import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers } from 'graphql-resolvers';


const isAuthenticated = (parent, args, { user }) => {
    return user ? skip : new ForbiddenError('Not authenticated as user.');
}


const resolvers = {
    Project: {
        client: async (project, args, { models }) => {
            const client = await models.Client.findById(project.clientId);
            return client;
        }
    },
    Query: {
        projects: combineResolvers(
            isAuthenticated,
            async (parent, args, { models, user }) => await models.Project.find({ userId: user.id })
        ),
        project: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => await models.Project.findById(args.id)
        )
    },
    Mutation: {
        createProject: combineResolvers(
            isAuthenticated,
            async (parent, args, { models, user}) => {
            const project = new models.Project({
                clientId: args.clientId,
                name: args.name,
                description: args.description,
                status: args.status,
                userId: user.id
            });
            await project.save();
            return project;
        }),
        editProject: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const project = await models.Project.findByIdAndUpdate(args.id, { $set: {
                clientId: args.clientId,
                name: args.name,
                description: args.description,
                status: args.status
            }});


            return project;
        }),
        deleteProject: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const project = await models.Project.findById(args.id);
            await project.remove();
            return project;
        }),
    }
};




export default resolvers;