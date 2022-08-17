import { Link, useParams } from "react-router-dom"
// use params can be used to get the parameter from the url
import Spinner from "../components/Spinner"
import { useQuery } from "@apollo/client"
import { GET_PROJECT } from '../queries/projectQueries'

export default function Project() {

  const { id } = useParams();
  console.log(id)
  const { loading, error, data } = useQuery(GET_PROJECT, {
    variables: { id }
  });


  if (loading) return <Spinner />;
  if (error) return <p>Something went wrong</p>;

  return (
    <div>Project</div>
  )
}
