import { ApolloServer, gql } from 'apollo-server-express'
import { makeExecutableSchema } from '@graphql-tools/schema'
import * as dotenv from 'dotenv'
dotenv.config() 
import express from 'express'
import http from 'http'
import models from './models';
import connectDB from './db'
import { Request as JWTRequest, expressjwt } from 'express-jwt'
import { applyMiddleware } from 'graphql-middleware'
import authorization from './authorization'
import { clientTypeDefs, Clients, clientResolvers } from './modules';
import { projectTypeDefs, Projects, projectResolvers } from './modules';
import { userTypeDefs, Users, userResolvers } from './modules';
import { User } from './_types/users'

const Query = gql`
  type Query {
    _empty: String
  }
`;


var cors = {
  origin: true,
  credentials: true, // <-- REQUIRED backend setting
}

async function startApolloServer() {
  const app = express();
  
  app.use(
    expressjwt({
      secret: "ELSJFX5MHABSAONN",
      algorithms: ['HS256'],
      credentialsRequired: false
    })
  )
  const httpServer = http.createServer(app);
  const typeDefs = [clientTypeDefs, userTypeDefs, projectTypeDefs, Query]
  const resolvers = [projectResolvers, clientResolvers, userResolvers]
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const server = new ApolloServer({
    schema: applyMiddleware(schema, authorization),
    context: async ({ req }: { req: JWTRequest<User> }) => {
      const authenticatedUser = req.auth || null
      console.log(authenticatedUser)
      const context = {
        authenticatedUser,
        secret: process.env.APP_SECRET,
        models
      }

      return context
    },
    dataSources: () => ({
      users: new Users(models.User),
      projects: new Projects(models.Project),
      clients: new Clients(models.Client)
    }),
  })

  await connectDB();
  await server.start()

  server.applyMiddleware({ app, cors })
  const port = process.env.PORT || 4000;
  await new Promise<void>(resolve => httpServer.listen({ port }, resolve));
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
}

startApolloServer()