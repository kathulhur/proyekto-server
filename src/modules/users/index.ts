import { readFileSync } from 'fs';
import { gql } from 'apollo-server-express';
import path from 'path';


export { default as resolvers } from './resolvers'
export const typeDefs = gql(readFileSync(path.join(__dirname, 'schema.graphql'), { encoding: 'utf-8' }));
export { default as dataSource } from './dataSource' 