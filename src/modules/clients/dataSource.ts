import { MongoDataSource } from "apollo-datasource-mongodb";
import { ApolloError } from "apollo-server-core";
import mongoose from "mongoose";
import { InvalidIdError } from "../_utils/errors/InvalidIdError";
import { ObjectId } from 'mongodb'
import { Context } from "../../_types/context";
import { ClientDocument, CreateClientArgs, DeleteClientArgs, UpdateClientArgs } from "../../_types/clients";
export default class Clients extends MongoDataSource<ClientDocument, Context> {
    async getClient(clientId: string | ObjectId) {
        try {
            if (mongoose.isValidObjectId(clientId)){
                return await this.findOneById(clientId)
            } else {
                throw new InvalidIdError(`The projectId provided: ${clientId} is invalid.`)
            }
        } catch (err) {
            console.log('dataSource:getProject')
            throw new ApolloError('Error fetching project')
        }
    }

    async getClients() {
        try {
            const clientIds = (await this.model.find({ deleted: { $ne: true }})).map((client: ClientDocument): ObjectId => {
                return client.id
            })

            return await this.findManyByIds(clientIds)

        } catch (err) {
            console.log('dataSource:getProjects')
            throw new ApolloError('Error fetching projects')
        }
    }

    async createOne(createClientArgs: CreateClientArgs) {
        try {
            const newClient = new this.model({
                ...createClientArgs,
            });

            return await newClient.save()
        } catch (err) {
            console.log('dataSource[Clients]:createOne')
            throw new ApolloError('Error creating clients')
        }
    }

    async updateOne(updateClientArgs: UpdateClientArgs) {
        const updatedClient = await this.model.findByIdAndUpdate(updateClientArgs.id, {
            ...updateClientArgs
        }, { new: true })

        return updatedClient
    }

    async deleteOne(clientId: ObjectId | string) {
        const deletedProject = await this.model.findByIdAndDelete(clientId)
        return deletedProject
    }
}