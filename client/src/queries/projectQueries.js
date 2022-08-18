import { gql } from '@apollo/client'


const GET_PROJECT = gql`
    query getProject($id: ID!) {
        project(id: $id) {
            id
            name
            description
            status
            clientId
            client {
                id
                name
                email
                phone
            }
        } 
    }
`;


const GET_PROJECTS = gql`
    query getProjects{
        projects{
            id
            name
            description
            status
            clientId
        }
    }
`;

export { GET_PROJECTS, GET_PROJECT };