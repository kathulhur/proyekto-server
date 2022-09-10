import { ApolloServer, gql } from 'apollo-server-express'
const { readFileSync } = require('fs');
import * as dotenv from 'dotenv'
dotenv.config() 
import express from 'express'
import http from 'http'
import models from './models.js';
import connectDB from './db.js'
import resolvers from './resolvers.js'
import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server-express'
import { merge } from 'lodash'

// const typeDefs = gql(readFileSync('./src/schema.graphql', { encoding: 'utf-8' }));

import { clientTypeDefs, projectTypeDefs, userTypeDefs } from './modules';
import { clientResolvers, projectResolvers, userResolvers } from './modules';


const Query = gql`
  type Query {
    _empty: String
  }
`;

const getUser = async ( req ) => {
  // @ts-ignore
  const token = req.headers.authorization;
  
  if (token) {
    try {
      // @ts-ignore
      const token = req.headers.authorization.split(' ')[1].replace(/^"(.*)"$/, '$1');
      // @ts-ignore
      let verifiedToken;
      try {
        verifiedToken = jwt.verify(token, process.env.APP_SECRET);
      } catch (err) {
        verifiedToken = {}
      }

      return verifiedToken;
    } catch (e) {
      console.log(e)
      // @ts-ignore
      throw new AuthenticationError('Your session expired. Sign in again.');
    }
  }
};

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: [clientTypeDefs, userTypeDefs, projectTypeDefs, Query],
    resolvers: [projectResolvers, clientResolvers, userResolvers],
    context: async ({ req }) => {
      // @ts-ignore
      const user = await getUser(req);

      return {
          models,
          user,
          secret: process.env.APP_SECRET,
          appName: process.env.APP_NAME,
      };
  },
  })

  await connectDB();
  await server.start()
  server.applyMiddleware({ app })
  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}

startApolloServer()