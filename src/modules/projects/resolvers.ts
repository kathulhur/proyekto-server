import { isValidObjectId } from 'mongoose';
import { Context } from '../../_types/context';
import { CreateProjectArgs, DeleteProjectArgs, Project, ProjectArgs, UpdateProjectArgs } from '../../_types/projects';

const resolvers = {
    Project: {
        client: async ({ clientId }: Project, _: undefined, { models }: Context) => {
            const client = await models.Client.findById(clientId);
            return client;
        }
    },
    Query: {
        projects: async (_: undefined, __: undefined, { dataSources }: Context) => {
            return await dataSources.projects.getProjects();
        },
        project: async (_: undefined, { id }: ProjectArgs, { dataSources: {projects} }: Context) => await projects.getProject(id)
    },
    Mutation: {
        createProject: async (_: undefined, createProjectArgs: CreateProjectArgs, { dataSources }: Context) => {
            return dataSources.projects.createOne(createProjectArgs);
        },
        updateProject: async (_: undefined, updateProjectArgs: UpdateProjectArgs, { dataSources }: Context) => {
            const updatedProject = await dataSources.projects.updateOne(updateProjectArgs);
            return updatedProject;
        },
        deleteProject: async (_: undefined, deleteProjectArgs: DeleteProjectArgs, { dataSources }: Context) => {
            const deletedProject = await dataSources.projects.deleteOne(deleteProjectArgs)
            return deletedProject
        },
    }
};




export default resolvers;