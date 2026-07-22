import { gql } from 'graphql-request';
import { graphQLClient } from './client';
import type {
  ContactDataQueryResponse,
  ContactDataQueryVariables,
  ContactPageData,
} from '../types/contact';

/** ID de WordPress de la página "Contacto" (puede sobreescribirse al llamar). */
export const CONTACT_PAGE_ID = 125;

/**
 * Query de la página de Contacto por ID.
 * Los campos ACF están anidados bajo `camposDeContacto` (no directamente en Page).
 */
export const GET_CONTACT_DATA_QUERY = gql`
  query GetContactData($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      title
      camposDeContacto {
        contactHero {
          bgMedia {
            node {
              sourceUrl
              mediaItemUrl
              altText
            }
          }
          titleText
          titleTag
          overline
          description
          button
        }
        contactDetails {
          addressText
          mapsIframe
          phoneNumber
          emailAddress
          openingHours
        }
        contactIntroCta {
          title
          description
          button
        }
      }
    }
  }
`;

export const fetchContactData = async (
  pageId: number = CONTACT_PAGE_ID,
): Promise<ContactPageData | null> => {
  const variables: ContactDataQueryVariables = { id: pageId };
  const response = await graphQLClient.request<ContactDataQueryResponse>(
    GET_CONTACT_DATA_QUERY,
    variables,
  );
  return response.page;
};
