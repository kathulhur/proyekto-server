import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApolloError } from 'apollo-server-express';
import { combineResolvers } from 'graphql-resolvers';
import axios from 'axios';
import { DeleteUserArgs, UpdateUserArgs, User, UserArgs, SignInArgs, ValidateCodeArgs, getTwoFactorAuthQrLinkArgs, CreateUserArgs} from '../../_types/users'
import { Context } from '../../_types/context'

const createToken = (loggedUser: User, secret: string, expiresIn: string) => {
    const { id, username, role } = loggedUser;
    return jwt.sign({ id, username, role }, secret, { expiresIn });
}

const resolvers = {
    Query: {
        users:
            async (_: undefined, __: undefined, { dataSources, authenticatedUser }: Context): Promise<(User | null | undefined)[]> => {
                return await dataSources.users.getUsers()
            },
        user: async (_: undefined, { id }: UserArgs, { dataSources }: Context): Promise<User | null | undefined> => {
            return await dataSources?.users.getUser(id) 
        },
        usersCount: async (_: undefined, __: undefined, { dataSources }: Context): Promise<number> => {
            return await dataSources.users.getUsersCount()
        },
        getLoggedInUser:
            async (_: undefined, __: undefined, { dataSources, authenticatedUser }: Context) => {
                return authenticatedUser && await dataSources.users.getUser(authenticatedUser.id!); // This can cause bug; fix this
            },
    },
    Mutation: {
        createUser: async (_: undefined, { username, password }: CreateUserArgs, { dataSources }: Context) => {

            const hashedPassword = await bcrypt.hash(password, 10); 
            const secretCode = await getSecretCode(process.env.GOOGLE_AUTH_API_KEY!);
            const twoFactorAuthQrLink = await getTwoFactorAuthQrLink({
                googleAuthApiKey: process.env.GOOGLE_AUTH_API_KEY!,
                appName: process.env.APP_NAME!,
                username,
                secretCode
            });
            
            const createUserArgs: User = {
                username,
                password: hashedPassword,
                secretCode,
                twoFactorAuthQrLink
            };
            
            const newUser = await dataSources.users.createOne(createUserArgs)
            
            return newUser;
        },
        updateUser: async (_: undefined, updateUserArgs: UpdateUserArgs, { dataSources }: Context) => {
            const updatedUser = await dataSources.users.updateOne(updateUserArgs)
            return updatedUser;
        },
        deleteUser: async (_: undefined, {id}: DeleteUserArgs, { dataSources }: Context) => {
            const user = await dataSources.users.deleteOne(id)
            return user;
        },
        signIn: async (_: undefined, { username, password }: SignInArgs, { models, secret }: Context) => {
            console.log('resolver: signIn')
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
                token: createToken(loggedUser, secret!, '1hr'),
                user: loggedUser
            };
        },
        validateCode: async(_: undefined, { userId, code }: ValidateCodeArgs, { models, secret }: Context) => {
            console.log("resolver: validateCode")
            const user = await models.User.findById(userId);
            const isValid = await validateTwoFactorAuth(process.env.GOOGLE_AUTH_API_KEY!, user.secretCode, code);
            if(!isValid) {
                throw new ApolloError('Invalid code');
            }
            return {
                code: 200,
                success: true,
                message: 'Code validated successfully',
                token: await createToken(user, secret!, '1hr'),
                user: user
            }
        }
    }
};


async function getSecretCode(googleAuthApiKey: string) {
    const options = {
        method: 'POST',
        url: 'https://google-authenticator.p.rapidapi.com/new_v2/',
        headers: {
            'X-RapidAPI-Key': googleAuthApiKey,
            'X-RapidAPI-Host': 'google-authenticator.p.rapidapi.com'
        }
    };

    try {
        const { data } = await axios.request(options)
        return data
    } catch (err) {
        throw new ApolloError('Error Generating Secret Code');
    }
}

async function getTwoFactorAuthQrLink({googleAuthApiKey, appName, username, secretCode}: getTwoFactorAuthQrLinkArgs) {
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

    try {
        const { data } = await axios.request(options)
        return data
    } catch (err) {
        throw new ApolloError('Error Generating QR Code Link');
    }
}

async function validateTwoFactorAuth(googleAuthApiKey: string, secretCode: string, code: string){
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