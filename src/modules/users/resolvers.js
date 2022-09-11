import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { skip } from 'graphql-resolvers';
import { ApolloError, ForbiddenError } from 'apollo-server-express';
import { combineResolvers } from 'graphql-resolvers';
import axios from 'axios';

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
            async (_, __, { models }) => await models.User.find(),
        ),
        user: combineResolvers(
            isAuthenticated,
            async (_, {id}, { models }) => await models.User.findById(id)
        ),
    },
    Mutation: {
        createUser: 
            async (_, { username, password }, { models }) => {

                const hashedPassword = await bcrypt.hash(password, 10); 
                const secretCode = await getSecretCode(process.env.GOOGLE_AUTH_API_KEY);
                const twoFactorAuthQrLink = await getTwoFactorAuthQrLink({
                    googleAuthApiKey: process.env.GOOGLE_AUTH_API_KEY,
                    appName: process.env.APP_NAME,
                    username,
                    secretCode
                });
                
                const user = new models.User({
                    username,
                    password: hashedPassword,
                    secretCode,
                    twoFactorAuthQrLink
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
            async (_, {id}, { models }) => {
            const user = await models.User.findById(id);
            await user.remove();
            return user;
        }),
        signIn: async (_, {username, password}, { models, secret }) => {
            const loggedUser = await models.User.findOne({ username: username });
            if (!loggedUser) {
                throw new Error('User not found');
            }
            const isValid = await bcrypt.compare(password, loggedUser.password);
            if (!isValid) {
                throw new Error('Invalid password');
            }

            return {
                code: 200,
                success: true,
                message: 'User logged in successfully',
                token: createToken(loggedUser, secret, '1hr'),
                user: loggedUser
            };
        },
        validateCode: async(_, { userId, code }, { models, secret }) => {
            const user = await models.User.findById(userId);
            const isValid = await validateTwoFactorAuth(process.env.GOOGLE_AUTH_API_KEY, user.secretCode, code);
            console.log(isValid)
            if(!isValid) {
                throw new ApolloError('Invalid code');
            }
            return {
                code: 200,
                success: true,
                message: 'Code validated successfully',
                token: createToken(user, secret, '1hr'),
                user: user
            }
        }
    }
};



async function getSecretCode(googleAuthApiKey) {
    const options = {
        method: 'POST',
        url: 'https://google-authenticator.p.rapidapi.com/new_v2/',
        headers: {
            'X-RapidAPI-Key': googleAuthApiKey,
            'X-RapidAPI-Host': 'google-authenticator.p.rapidapi.com'
        }
    };
    
    let response = '';

    try {
        response = await axios.request(options)
    } catch (err) {
        throw new ApolloError('Error Generating Secret Code');
    }
    return response.data
}

async function getTwoFactorAuthQrLink({googleAuthApiKey, appName, username, secretCode}) {
    const encodedParams = new URLSearchParams();
    encodedParams.append("secret", secretCode);
    encodedParams.append("account", username);
    encodedParams.append("issuer", appName);

    const options = {
        method: 'POST',
        url: 'https://google-authenticator.p.rapidapi.com/enroll/',
        params: {secret: googleAuthApiKey, issuer: appName, account: username},
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': googleAuthApiKey,
            'X-RapidAPI-Host': 'google-authenticator.p.rapidapi.com'
        },
        data: encodedParams
    }

    let response = '';
    try {
        response = await axios.request(options)
    } catch (err) {
        throw new ApolloError('Error Generating QR Code Link');
    }
    return response.data
}

async function validateTwoFactorAuth(googleAuthApiKey, secretCode, code){
    const encodedParams = new URLSearchParams();
    encodedParams.append("secret", secretCode);
    encodedParams.append("code", code);

    const options = {
        method: 'POST',
        url: 'https://google-authenticator.p.rapidapi.com/validate/',
        params: {code: code, secret: secretCode},
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': googleAuthApiKey,
            'X-RapidAPI-Host': 'google-authenticator.p.rapidapi.com'
        },
        data: encodedParams
    };

    return axios.request(options).then(function (response) {
        console.log(response)
        console.log('True' === response.data)
        return 'True' === response.data
    }).catch(function (error) {
        throw new ApolloError('Google Auth API Error');
    });
}

export default resolvers;