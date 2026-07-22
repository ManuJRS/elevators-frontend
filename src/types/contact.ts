/** Etiqueta HTML permitida para el título del hero (ACF select). */
export type ContactTitleTag = 'h1' | 'h2' | 'h3' | 'h4';

/**
 * Botón/CTA de las secciones de contacto.
 *
 * Nota: el backend actual expone `button` como String plano (URL),
 * igual que en el home. Si el campo ACF se cambia a tipo "Link",
 * actualizar a `{ url, title, target }` junto con la query.
 */
export type ContactButton = string | null;

/** Media del hero: `MediaItem` envuelto en `node` por WPGraphQL. */
export interface ContactBgMedia {
  node: {
    sourceUrl: string | null;
    mediaItemUrl: string | null;
    altText: string | null;
  } | null;
}

/** Grupo ACF `contact_hero` (dentro de `camposDeContacto`). */
export interface ContactHero {
  bgMedia: ContactBgMedia | null;
  titleText: string | null;
  /**
   * ACF Select puede devolver string o array de un valor
   * (p. ej. `["h1"]`). Normalizar en la vista.
   */
  titleTag: ContactTitleTag | ContactTitleTag[] | null;
  overline: string | null;
  description: string | null;
  button: ContactButton;
}

/** Grupo ACF `contact_details` (dentro de `camposDeContacto`). */
export interface ContactDetails {
  addressText: string | null;
  mapsIframe: string | null;
  phoneNumber: string | null;
  emailAddress: string | null;
  openingHours: string | null;
}

/** Grupo ACF `contact_intro_cta` (dentro de `camposDeContacto`). */
export interface ContactIntroCta {
  title: string | null;
  description: string | null;
  button: ContactButton;
}

/**
 * Grupo ACF raíz expuesto en Page como `camposDeContacto`.
 * Los subgrupos no viven directamente en `Page`.
 */
export interface CamposDeContacto {
  contactHero: ContactHero | null;
  contactDetails: ContactDetails | null;
  contactIntroCta: ContactIntroCta | null;
}

/** Nodo `page` de Contacto con el grupo ACF. */
export interface ContactPageData {
  title: string | null;
  camposDeContacto: CamposDeContacto | null;
}

/** Respuesta completa de la query GraphQL de la página de Contacto. */
export interface ContactDataQueryResponse {
  page: ContactPageData | null;
}

/** Variables de la query (ID de WordPress de la página). */
export interface ContactDataQueryVariables {
  id: number;
}
