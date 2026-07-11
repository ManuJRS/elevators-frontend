// src/types/product.ts

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface VariationAttribute {
  id: string;
  name: string | null;
  value: string | null;
  label: string | null;
}

export interface ProductAttribute {
  id: string;
  label: string | null;
  name: string | null;
  variation: boolean | null;
}

export interface ProductVariation {
  id: string;
  name: string;
  price: string;
  databaseId: number;
  sku: string | null;
  image: ProductImage | null;
  attributes?: {
    nodes: VariationAttribute[];
  };
}

export interface ProductImage {
  sourceUrl: string;
  altText: string | null;
}

export interface WCProduct {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string;
  image: ProductImage | null;
  productCategories?: {
    nodes: ProductCategory[];
  };
  attributes?: {
    nodes: ProductAttribute[];
  };
  variations?: {
    nodes: ProductVariation[];
  };
}

export interface CatalogQueryResponse {
  products: {
    nodes: WCProduct[];
  };
}

export interface FilterOption {
  value: string;
  label: string;
}
