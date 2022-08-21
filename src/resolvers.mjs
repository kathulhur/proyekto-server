import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { skip } from 'graphql-resolvers';
import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers } from 'graphql-resolvers';


const isAuthenticated = (parent, args, { user }) => {
    return user ? skip : new ForbiddenError('Not authenticated as user.');
}



const createToken = async (loggedUser, secret, expiresIn) => {
    const { id, username } = loggedUser;
    return await jwt.sign({ id, username }, secret, { expiresIn });
}

const resolvers = {
    Project: {
        client: async (project, args, { models }) => {
            const client = await models.Client.findById(project.clientId);
            return client;
        }
    },
    Query: {
        users: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => await models.User.find(),
        ),
        user: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => await models.User.findById(args.id)
        ),
        clients: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => await models.Client.find(),
        ),
        client: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => await models.Client.findById(args.id)
        ),
        projects: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => await models.Project.find()
        ),
        project: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => await models.Project.findById(args.id)
        )
    },
    Mutation: {
        createUser: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const user = new models.User({
                username: args.username,
                password: args.password,
                secretCode: args.secretCode
            });
            await user.save();
            return user;
        }),
        createClient: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const client = new models.Client({
                name: args.name,
                email: args.email,
                phone: args.phone
            });
            await client.save();
            return client;
        }),
        createProject: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const project = new models.Project({
                clientId: args.clientId,
                name: args.name,
                description: args.description,
                status: args.status
            });
            await project.save();
            return project;
        }),
        editUser: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const user = await models.User.findByIdAndUpdate(args.id, { $set: {
                username: args.username,
                password: args.password,
                secretCode: args.secretCode,
                twoFactorAuthEnabled: args.twoFactorAuthEnabled
            }});

            return user;
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
        deleteUser: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const user = await models.User.findById(args.id);
            await user.remove();
            return user;
        }),
        deleteClient: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const client = await models.Client.findById(args.id);
            await models.Project.deleteMany({ clientId: args.id });
            await client.remove();
            return client;
        }),
        deleteProject: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const project = await models.Project.findById(args.id);
            await project.remove();
            return project;
        }),
        signIn: async (parent, args, { user, models, secret }) => {
            const loggedUser = await models.User.findOne({ username: args.username });
            if (!loggedUser) {
                throw new Error('User not found');
            }
            const isValid = await bcrypt.compare(args.password, loggedUser.password);
            if (!isValid) {
                throw new Error('Invalid password');
            }
            return { 
                token: createToken(loggedUser, secret, '1hr'),
                user: loggedUser
            };
        },
        signUp: async (parent, args, { user, models, secret }) => {
            const createdUser = await models.User.create({
                username: args.username,
                password: await bcrypt.hash(args.password, 10),
                secretCode: args.secretCode
            });

            return { 
                token: createToken(createdUser, secret, '1hr'),
                user: createdUser
            };
        }
    }
};


export default resolvers;