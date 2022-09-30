import { ApolloServer, gql } from 'apollo-server-express'
import * as dotenv from 'dotenv'
dotenv.config() 
import express from 'express'
import http from 'http'
import models from './models';
import connectDB from './db'
import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server-express'


import { clientTypeDefs, Clients, clientResolvers } from './modules';
import { projectTypeDefs, Projects, projectResolvers } from './modules';
import { userTypeDefs, Users, userResolvers } from './modules';

const Query = gql`
  type Query {
    _empty: String
  }
`;

// @ts-ignore
const getAuthenticatedUser = async ( req ) => {
  // @ts-ignore
  const token = req.headers.authorization;
  
  if (token) {
    try {
      // @ts-ignore
      const token = req.headers.authorization.split(' ')[1].replace(/^"(.*)"$/, '$1');
      // @ts-ignore
      let verifiedToken = null;
      try {
        // @ts-ignore
        verifiedToken = jwt.verify(token, process.env.APP_SECRET);
      } catch (err) {
        throw new AuthenticationError('Invalid token. Sign in again.');
      }

      return verifiedToken;
    } catch (e) {
      // @ts-ignore
      throw new AuthenticationError('Your token has expired. Sign in again.');
    }
  }
};

var cors = {
  origin: true,
  credentials: true, // <-- REQUIRED backend setting
}

async function startApolloServer() {
  const app = express();

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: [clientTypeDefs, userTypeDefs, projectTypeDefs, Query],
    resolvers: [projectResolvers, clientResolvers, userResolvers],
    introspection: true,
    context: async ({ req }) => {
      // console.log('Getting Authenticated user...')
      // const authenticatedUser = await getAuthenticatedUser(req);
      const authenticatedUser = {}
      // console.log(authenticatedUser)
      // console.log('Successfully got Authenticated user...')

      return {
          models,
          authenticatedUser,
          secret: process.env.APP_SECRET,
      };
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