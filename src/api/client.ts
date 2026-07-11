import { GraphQLClient } from 'graphql-request';

const endpoint: string =
  (import.meta.env.VITE_GRAPHQL_URL as string) || 'http://localhost:8080/graphql';

export const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export const syncGraphQLAuthHeaders = (token: string | null): void => {
  if (token) {
    graphQLClient.setHeader('Authorization', `Bearer ${token}`);
    console.info('[Auth] Header Authorization configurado para peticiones GraphQL.');
    return;
  }

  graphQLClient.setHeader('Authorization', '');
  console.info('[Auth] Header Authorization eliminado de peticiones GraphQL.');
};
