import { shield, and } from "graphql-shield";
import { isAdmin } from "./isAdmin";
import { isAuthenticated } from "./isAuthenticated";



export default shield({
    Query: {
        viewer: isAuthenticated,
        users: and(isAuthenticated, isAdmin)
    }
})