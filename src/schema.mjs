import { gql } from 'apollo-server-express';

const schema = gql`
    type Query {
        login: Token,
        user(id: ID!): User,
        users: [User],
        client(id: ID!): Client,
        clients: [Client],
        project(id: ID!): Project,
        projects: [Project]
        googleAuthApiKey: String
    }

    type Token {
        token: String!
    }

    type User {
        id: ID!
        username: String
        password: String
        role: Role
        secretCode: String
        twoFactorAuthEnabled: Boolean
    }

    type Client {
        id: ID!
        name: String
        email: String
        phone: String
        userId: ID
    }

    type Project {
        id: ID!
        clientId: ID
        client: Client
        name: String
        description: String
        status: Status
        userId: ID
    }

    enum Status {
        NEW,
        PROGRESS,
        COMPLETED
    }

    enum Role {
        ADMIN,
        USER
    }

    type AuthPayload {
        token: String!
        user: User!
    }


    type Mutation {
        createUser(username: String!, password: String!, secretCode: String!): User
        createClient(name: String!, email: String!, phone: String!): Client
        createProject(clientId: ID!, name: String!, description: String!, status: Status!): Project
        editUser(id: ID!, username: String, password: String, secretCode: String, twoFactorAuthEnabled: Boolean): User
        editClient(id: ID!, name: String, email: String, phone: String): Client
        editProject(id: ID!, clientId: ID, name: String, description: String, status: Status): Project
        deleteUser(id: ID!): User
        deleteClient(id: ID!): Client
        deleteProject(id: ID!): Project
        signIn(username: String!, password: String!): AuthPayload!
        signUp(username: String!, password: String!, secretCode: String!): AuthPayload!

    }

`;

export default schema;