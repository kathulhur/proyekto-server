// Mongoose Models
const Project = require('../models/Project');
const Client = require('../models/Client');

const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList } = require('graphql');
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
                return Clients.find(parentValue.clientId);
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
                return Client.find(args.id);
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
                return Project.find(args.id);
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

module.exports = new GraphQLSchema({ 
    query: RootQuery,
});