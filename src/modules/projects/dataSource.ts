import { MongoDataSource } from "apollo-datasource-mongodb";
import { ApolloError } from "apollo-server-core";
import mongoose from "mongoose";
import { InvalidIdError } from "../_utils/errors/InvalidIdError";
import { ObjectId } from 'mongodb'
import { Project, ProjectDocument, CreateProjectArgs, UpdateProjectArgs, DeleteProjectArgs } from "../../_types/projects";
import { Context } from "../../_types/context";
export default class Projects extends MongoDataSource<ProjectDocument, Context> {
    async getProject(projectId: string | ObjectId) {
        try {
            if (mongoose.isValidObjectId(projectId)){
                return await this.findOneById(projectId)
            } else {
                throw new InvalidIdError(`The projectId provided: ${projectId} is invalid.`)
            }
        } catch (err) {
            console.log('dataSource:getProject')
            throw new ApolloError('Error fetching project')
        }
    }

    async getProjects() {
        try {
            const projectIds = (await this.model.find({ deleted: { $ne: true }})).map((project: ProjectDocument): ObjectId => {
                return project.id
            })

            return await this.findManyByIds(projectIds)

        } catch (err) {
            console.log('dataSource:getProjects')
            throw new ApolloError('Error fetching projects')
        }
    }

    async createOne(createProjectArgs: CreateProjectArgs) {
        try {
            const newProject = new this.model({
                ...createProjectArgs,
            });

            return await newProject.save()
        } catch (err) {
            console.log('dataSource:getProjects')
            throw new ApolloError('Error creating projects')
        }
    }

    async updateOne(updateProjectArgs: UpdateProjectArgs) {
        const updatedProject = await this.model.findByIdAndUpdate(updateProjectArgs.id, {
            ...updateProjectArgs
        }, { new: true })

        return updatedProject
    }

    async deleteOne(deleteProjectArgs: DeleteProjectArgs) {
        const deletedProject = await this.model.findByIdAndDelete(deleteProjectArgs.id)
        return deletedProject
    }
}