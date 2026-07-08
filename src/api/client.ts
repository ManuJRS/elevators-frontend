// src/api/client.ts
import { GraphQLClient } from 'graphql-request';

// Forzamos el tipado de la variable de entorno de Vite
const endpoint: string = (import.meta.env.VITE_GRAPHQL_URL as string) || 'http://localhost:8080/graphql';

export const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});