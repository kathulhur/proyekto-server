import { useNavigate } from "react-router-dom"
// useNavigate: can be used to navigate to another page
import { FaTrash } from "react-icons/fa"
import { GET_PROJECTS } from "../queries/projectQueries"
import { useMutation } from "@apollo/client"
import { DELETE_PROJECT } from "../mutations/projectMutations"

export default function DeleteProjectButton({ projectId }) {

    const navigate = useNavigate();

    const [deleteProject] = useMutation(DELETE_PROJECT, {
        variables: { id: projectId },
        onCompleted: () => navigate("/"),
        // refetchQueries: [{ query: GET_PROJECTS }] // * not required because we are redirecting after deletion, so projects will already get fetched again
    });


    return (
        <div className="d-flex mt-5 ms-auto">
            <button className="btn btn-danger m-2" onClick={deleteProject}>
                <FaTrash className='icon'/> Delete Project
            </button>
        </div>
    )
}
