import { gql } from '@apollo/client';

// the same syntax as with the graphiql
const GET_CLIENTS = gql` 
    query getClients {
        clients {
            id
            name
            email
            phone
        }
    }
`;


export { GET_CLIENTS };