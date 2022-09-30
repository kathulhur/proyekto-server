import { ApolloError } from "apollo-server-core";

export class InvalidIdError extends ApolloError {
    constructor(message: string) {
        super(message, 'INVALID_ID_ERROR')

        Object.defineProperty(this, 'name', { value: 'InvalidIdError'})
    }
}