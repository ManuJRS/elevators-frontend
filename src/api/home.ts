import { gql } from 'graphql-request';
import { graphQLClient } from './client';
import type { HomeDataQueryResponse, HomeDataQueryVariables, HomePageData } from '../types/home';

/** ID de WordPress de la página "Inicio" (puede sobreescribirse al llamar). */
export const HOME_PAGE_ID = 120;

/**
 * Query del home por ID de página.
 * - `title: homeIntro` alía el campo interno del grupo intro como `title`.
 * - `featuredProducts.nodes` es `ContentNode[]`, por eso el fragmento `... on Product`.
 */
export const GET_HOME_DATA_QUERY = gql`
  query GetHomeData($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      databaseId
      title
      homeHero {
        bgMedia {
          node {
            sourceUrl
            altText
          }
        }
        titleText
        titleTag
        overline
        description
        button
      }
      homeIntro {
        title: homeIntro
        description
        button
      }
      productosDestacados {
        featuredProducts {
          nodes {
            __typename
            id
            ... on Product {
              databaseId
              name
              slug
              sku
              shortDescription
              image {
                sourceUrl
                altText
              }
            }
            ... on SimpleProduct {
              price
            }
            ... on VariableProduct {
              price
            }
          }
        }
      }
    }
  }
`;

/** Consulta ligera usada solo cuando ACF no tiene productos seleccionados. */
export const GET_LATEST_HOME_PRODUCTS_QUERY = gql`
  query GetLatestHomeProducts {
    products(first: 4, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        __typename
        id
        databaseId
        name
        slug
        sku
        shortDescription
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price
        }
        ... on VariableProduct {
          price
        }
      }
    }
  }
`;

export const fetchHomeData = async (
  pageId: number = HOME_PAGE_ID,
): Promise<HomePageData | null> => {
  const variables: HomeDataQueryVariables = { id: pageId };
  const response = await graphQLClient.request<HomeDataQueryResponse>(
    GET_HOME_DATA_QUERY,
    variables,
  );
  return response.page;
};
