import { useQuery } from '@apollo/client'
import ClientRow from './ClientRow'
import Spinner from './Spinner';
import { GET_CLIENTS } from '../queries/clientQueries';
// gql: used to make the query
// useQuery: to use the query in our components and get the data as well as the loading state, errors, etc.



export default function Clients() {
    const { loading, error, data } = useQuery(GET_CLIENTS);
    // loading: true or false
    // error: if there is an error
    // data: actual data
    if (loading) return <Spinner/>
    if (error) return <p>Something Went Wrong</p>
    return (
        <>
            { !loading && !error && (
                <table className="table table-hover mt-3">
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Email</td>
                            <td>Phone</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        { data.clients.map(client => (
                            <ClientRow key={client.id} client={client} />
                        ))}
                    </tbody>
                </table>
            )}
        </>
    )
}
