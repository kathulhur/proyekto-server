import { isValidObjectId } from 'mongoose';
import { ClientArgs, CreateClientArgs, DeleteClientArgs, UpdateClientArgs } from '../../_types/clients';
import { Context } from '../../_types/context';
import { ApolloError } from 'apollo-server-core';
import { InvalidIdError } from '../_utils/errors/InvalidIdError';

const resolvers = {
    Query: {
        clients: async (_: any, __: any, { dataSources }: Context) => {
            return await dataSources.clients.getClients();
        },
        client: async (_: any, args: ClientArgs, { dataSources }: Context) => {
            
            if (!isValidObjectId(args.id)) {
                console.log('Query:client')
                throw new InvalidIdError(`Invalid client ID ${args.id}`)
            }

            try {
                const client = await dataSources.clients.getClient(args.id);
                return client
            } catch (err) {
                console.log('Query:client')
                throw new ApolloError(`Error fetching client`)
            }
        }
    },
    Mutation: {
        createClient:
            async (_: undefined, createClientArgs: CreateClientArgs, { dataSources: {clients} }: Context) => {
            const newClient = await clients.createOne(createClientArgs)
            return newClient
        },
        updateClient: async (_: undefined, updateClientArgs: UpdateClientArgs, { dataSources: {clients} }: Context) => {
            const updatedClient = await clients.updateOne(updateClientArgs)
            
            return updatedClient;
        },
        deleteClient: async (_: undefined, deleteClientArgs: DeleteClientArgs, { dataSources: {clients} }: Context) => {
            const deletedClient = await clients.deleteOne(deleteClientArgs.id)
            return deletedClient;
        },
    }
}


export default resolvers;