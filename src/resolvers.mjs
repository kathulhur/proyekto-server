import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
        users: async (parent, args, { models }) => await models.User.find(),
        user: async (parent, args, { models }) => await models.User.findById(args.id),
        clients: async (parent, args, { models }) => await models.Client.find(),
        client: async (parent, args, { models }) => await models.Client.findById(args.id),
        projects: async (parent, args, { models }) => await models.Project.find(),
        project: async (parent, args, { models }) => await models.Project.findById(args.id),
    },
    Mutation: {
        createUser: async (parent, args, { models }) => {
            const user = new models.User({
                username: args.username,
                password: args.password,
                secretCode: args.secretCode
            });
            await user.save();
            return user;
        },
        createClient: async (parent, args, { models }) => {
            const client = new models.Client({
                name: args.name,
                email: args.email,
                phone: args.phone
            });
            await client.save();
            return client;
        },
        createProject: async (parent, args, { models }) => {
            const project = new models.Project({
                clientId: args.clientId,
                name: args.name,
                description: args.description,
                status: args.status
            });
            await project.save();
            return project;
        },
        editUser: async (parent, args, { models }) => {
            const user = await models.User.findByIdAndUpdate(args.id, { $set: {
                username: args.username,
                password: args.password,
                secretCode: args.secretCode,
                twoFactorAuthEnabled: args.twoFactorAuthEnabled
            }});

            return user;
        },
        editClient: async (parent, args, { models }) => {
            const client = await models.Client.findByIdAndUpdate(args.id, {
                name: args.name,
                email: args.email,
                phone: args.phone
            }); 

            return client;
        },
        editProject: async (parent, args, { models }) => {
            const project = await models.Project.findByIdAndUpdate(args.id, { $set: {
                clientId: args.clientId,
                name: args.name,
                description: args.description,
                status: args.status
            }});


            return project;
        },
        deleteUser: async (parent, args, { models }) => {
            const user = await models.User.findById(args.id);
            await user.remove();
            return user;
        },
        deleteClient: async (parent, args, { models }) => {
            const client = await models.Client.findById(args.id);
            await client.remove();
            return client;
        },
        deleteProject: async (parent, args, { models }) => {
            const project = await models.Project.findById(args.id);
            await project.remove();
            return project;
        },
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