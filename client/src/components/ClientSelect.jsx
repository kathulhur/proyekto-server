import { useQuery } from "@apollo/client"
import { GET_CLIENTS } from "../queries/clientQueries"
import Spinner from "./Spinner"

export default function ClientSelect({ onChange }) {

    const { loading, error, data } = useQuery(GET_CLIENTS)
    if (loading) return <Spinner/>
    if (error) return <p>Something Went Wrong</p>

    return (
        <div className="mb-3">
            <label className="form-label">Client</label>
            <select className="form-select" aria-label="Default select example" defaultValue="In Progress" onChange={onChange}>
            { !loading && !error && 
                    data.clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                ))}
            
            </select>
        </div>
    )
}
