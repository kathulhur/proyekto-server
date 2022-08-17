// Mongoose Models
const Project = require('../models/Project');
const Client = require('../models/Client');

const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType } = require('graphql');
const { model } = require('mongoose');


// Client Type
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({ // function that returns an object
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString }
    })
});

const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID },
        client: { 
            type: ClientType,
            resolve: (parentValue, args) => {
                return Client.find(parentValue.clientId);
            }
        },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        client: {
            type: ClientType,
            args: { id: { type: GraphQLID }},
            resolve(parentValue, args) {
                return Client.findById(args.id);
            }
        },
        clients: {
            type: new GraphQLList(ClientType),
            resolve: (parentValue, args) => {
                return Client.find();
            }
        },
        project: {
            type: ProjectType,
            args: { id: { type: GraphQLID }},
            resolve: (parentValue, args) => {
                return Project.findById(args.id);
            }
        },
        projects: {
            type: new GraphQLList(ProjectType),
            resolve: () => {
                // return projects
                return Project.find();
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addClient: {
            type: ClientType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                phone: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args){
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone
                })

                return client.save();
            }
        },
        deleteClient: {
            type: ClientType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args){
                return Client.findByIdAndRemove(args.id)
            }
        },
        addProject: {
            type: ProjectType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: new GraphQLNonNull(GraphQLString) },
                status: { 
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            'new': { value: "Not Started" },
                            'progress': { value: "In Progress" },
                            'completed': { value: "Completed" }
                        }
                    }),
                    defaultValue: "Not Started"
                },
                clientId: { type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId
                });

                return project.save();
            }
        },
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Project.findByIdAndRemove(args.id);
            }
        },
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: { 
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values: {
                            'new': { value: "Not Started" },
                            'progress': { value: "In Progress" },
                            'completed': { value: "Completed" }
                        }
                    })
                },
            },
            resolve(parent, args) {
                return Project.findByIdAndUpdate(
                    args.id, 
                    {
                        $set: {
                            name: args.name,
                            description: args.description,
                            status: args.status
                        }
                    },
                    { new: true }
                )
            }
        }
    }
})

module.exports = new GraphQLSchema({ 
    query: RootQuery,
    mutation
});