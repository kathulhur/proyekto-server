import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { skip } from 'graphql-resolvers';
import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers } from 'graphql-resolvers';


const isAuthenticated = (parent, args, { user }) => {
    return user ? skip : new ForbiddenError('Not authenticated as user.');
}

const isAdmin = (parent, args, { user }) => {
    return user && user.role === 'ADMIN' ? skip : new ForbiddenError('Not authenticated as admin.');
}


const createToken = async (loggedUser, secret, expiresIn) => {
    const { id, username, role } = loggedUser;
    return await jwt.sign({ id, username, role }, secret, { expiresIn });
}

const resolvers = {
    Query: {
        googleAuthApiKey: () => process.env.GOOGLE_AUTH_API_KEY,
        appName: () => process.env.APP_NAME,
        users: combineResolvers(
            isAdmin,
            async (parent, args, { models }) => await models.User.find(),
        ),
        user: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => await models.User.findById(args.id)
        ),
    },
    Mutation: {
        validateTwoFactorAuth: async (parent, args, { appName }) => {
            const { code, secretCode } = args;
            const isValid = await validateTwoFactorAuth(code, secretCode);
            return isValid;
        },
        createUser: 
            async (parent, args, { models }) => {

                const hashedPassword = await bcrypt.hash(args.password, 10); 
                const user = new models.User({
                    username: args.username,
                    password: hashedPassword,
                    secretCode: args.secretCode,
                    twoFactorAuthQrLink: args.twoFactorAuthQrLink
                });
                await user.save();
                return user;
            },
        editUser: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const user = await models.User.findByIdAndUpdate(args.id, { $set: {
                username: args.username,
                password: args.password,
                secretCode: args.secretCode,
                twoFactorAuthEnabled: args.twoFactorAuthEnabled,
                role: args.role,
            }}, { new: true });

            return user;
        }),
        deleteUser: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
            const user = await models.User.findById(args.id);
            await user.remove();
            return user;
        }),
        signIn: async (parent, args, { models, secret }) => {
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
        }
    }
};




export default resolvers;