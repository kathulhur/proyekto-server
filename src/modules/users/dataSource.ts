import { MongoDataSource } from "apollo-datasource-mongodb";
import { ApolloError } from "apollo-server-core";
import mongoose from "mongoose";
import { CreateUserArgs, DeleteUserArgs, UpdateUserArgs, User, UserDocument } from "../../_types/users";
import { InvalidIdError } from "../_utils/errors/InvalidIdError";
import { ObjectId } from 'mongodb'
import { Context } from "../../_types/context"

export default class Users extends MongoDataSource<UserDocument, Context> {
    async getUser(userId: string | ObjectId) {
        if (!mongoose.isValidObjectId(userId)){
            throw new InvalidIdError(`The userId provided: ${userId} is invalid.`)
        }

        try {
            const user = await this.findOneById(userId)
            return user
        } catch (err) {
            console.log('Error at: dataSource:getUser')
            throw new ApolloError('Error fetching user')
        }
    }

    async getUsers() {
        
        try {
            const userIds = (await this.model.find({ deleted: { $ne: true } })).map((user: UserDocument): ObjectId => {
                return user.id
            })
            return await this.findManyByIds(userIds)

        } catch (err) {
            console.log('Error at: dataSource:getUsers')
            throw new ApolloError('Error fetching users')
        }
    }

    async updateOne(updateUserArgs: UpdateUserArgs) {
        if (!mongoose.isValidObjectId(updateUserArgs.id)) {
            throw new InvalidIdError(`The userId provided: ${updateUserArgs.id} is invalid.`)
        }
        
        try {
            const updatedUser = await this.model.findByIdAndUpdate(updateUserArgs.id, {
                    ...updateUserArgs
                }, { new: true })
            return updatedUser

        } catch (err) {
            console.log('Error at: dataSource:updateUser')
            throw new ApolloError('Error updating user')
        }
    }

    async createOne(userArgs: User) {
        const newUser = new this.model(
            {...userArgs}
        )
        try {
            await newUser.save()            
            return newUser
        } catch (err) {
            console.log('Error at: dataSource:createUser')
            throw new ApolloError('Error creating user')
        }
    }

    async deleteOne(userId: string | ObjectId) {
        if (!mongoose.isValidObjectId(userId)) {
            throw new InvalidIdError(`The userId provided: ${userId} is invalid.`)
        }

        try {
            const deletedUser = await this.model.findByIdAndDelete(userId)
            return deletedUser
        } catch {
            console.log('Error at: dataSource:createUser')
            throw new ApolloError(`Error deleting user with id ${userId}.`)
        }
    }

    async getUsersCount() {
        return this.model.countDocuments()
    }
}