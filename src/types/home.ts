import type { ProductImage } from './product';

/** Etiqueta HTML permitida para el título del hero (ACF select). */
export type HomeTitleTag = 'h1' | 'h2' | 'h3' | 'h4';

/**
 * Botón/CTA de las secciones del home.
 *
 * Nota: el backend actual expone `button` como String plano (URL).
 * Si el campo ACF se cambia a tipo "Link", actualizar a
 * `{ url, title, target }` junto con la query.
 */
export type HomeButton = string | null;

/** Media del hero: `MediaItem` envuelto en `node` por WPGraphQL. */
export interface HomeMedia {
  node: {
    sourceUrl: string;
    altText: string | null;
  } | null;
}

/** Grupo ACF `home_hero`. */
export interface HomeHero {
  bgMedia: HomeMedia | null;
  titleText: string | null;
  titleTag: HomeTitleTag | null;
  overline: string | null;
  description: string | null;
  button: HomeButton;
}

/** Grupo ACF `home_intro` (el título se alía desde el campo `homeIntro`). */
export interface HomeIntro {
  title: string | null;
  description: string | null;
  button: HomeButton;
}

/** Producto destacado (nodo de la relación ACF `featured_products`). */
export interface HomeFeaturedProduct {
  __typename: string;
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string | null;
  image: ProductImage | null;
  /** Solo presente en SimpleProduct / VariableProduct. */
  price?: string | null;
}

/** Grupo ACF `home_products` (expuesto como `productosDestacados`). */
export interface HomeProducts {
  featuredProducts: {
    nodes: HomeFeaturedProduct[];
  } | null;
}

/** Nodo `page` del home con sus grupos ACF. */
export interface HomePageData {
  databaseId: number;
  title: string | null;
  homeHero: HomeHero | null;
  homeIntro: HomeIntro | null;
  productosDestacados: HomeProducts | null;
}

/** Respuesta completa de `GET_HOME_DATA_QUERY`. */
export interface HomeDataQueryResponse {
  page: HomePageData | null;
}

/** Variables de la query (ID de WordPress de la página). */
export interface HomeDataQueryVariables {
  id: number;
}

/** Respuesta de respaldo con las últimas cuatro refacciones publicadas. */
export interface LatestHomeProductsQueryResponse {
  products: {
    nodes: HomeFeaturedProduct[];
  };
}
