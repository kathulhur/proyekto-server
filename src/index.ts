import { ApolloServer, gql } from 'apollo-server-express'
const { readFileSync } = require('fs');
import * as dotenv from 'dotenv'
dotenv.config() 
import express from 'express'
import http from 'http'
import models from './models.js';
import connectDB from './db.js'
import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server-express'


import { clientTypeDefs, projectTypeDefs, userTypeDefs } from './modules';
import { clientResolvers, projectResolvers, userResolvers } from './modules';


const Query = gql`
  type Query {
    _empty: String
  }
`;

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
  origin: 'https://proyekto.kathulhudev.me',
  credentials: true, // <-- REQUIRED backend setting
}

async function startApolloServer() {
  const app = express();

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: [clientTypeDefs, userTypeDefs, projectTypeDefs, Query],
    resolvers: [projectResolvers, clientResolvers, userResolvers],
    context: async ({ req }) => {
      // @ts-ignore
      console.log('Getting Authenticated user...')
      const authenticatedUser = await getAuthenticatedUser(req);
      console.log(authenticatedUser)
      console.log('Successfully got Authenticated user...')

      return {
          models,
          authenticatedUser,
          secret: process.env.APP_SECRET,
      };
    },
  })

  await connectDB();
  await server.start()

  server.applyMiddleware({ app, cors })
  await new Promise<void>(resolve => httpServer.listen({ port: process.env.PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}

startApolloServer()