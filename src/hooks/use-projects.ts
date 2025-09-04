import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECTS, GET_PROJECT, CREATE_PROJECT } from '@/graphql/queries';

export function useProjects() {
  const { data, loading, error, refetch } = useQuery(GET_PROJECTS);

  return {
    projects: data?.projects || [],
    loading,
    error,
    refetch,
  };
}

export function useProject(id: string) {
  const { data, loading, error, refetch } = useQuery(GET_PROJECT, {
    variables: { id },
    skip: !id,
  });

  return {
    project: data?.project || null,
    loading,
    error,
    refetch,
  };
}

export function useCreateProject() {
  const [createProject, { loading, error }] = useMutation(CREATE_PROJECT);

  const handleCreateProject = async (input: {
    name: string;
    description: string;
  }) => {
    try {
      const result = await createProject({
        variables: { input },
        refetchQueries: [{ query: GET_PROJECTS }],
      });
      return result.data?.createProject;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  return {
    createProject: handleCreateProject,
    loading,
    error,
  };
}
