// src/types/product.ts

export interface ProductVariation {
    id: string;
    name: string;
    price: string;
    databaseId: number;
    image: ProductImage | null;
  }
  
  export interface ProductImage {
    sourceUrl: string;
    altText: string | null;
  }
  
  export interface WCProduct {
    id: string;
    databaseId: number;
    name: string;
    shortDescription: string;
    image: ProductImage | null;
    // Agregamos la propiedad opcional para variaciones de productos variables
    variations?: {
      nodes: ProductVariation[];
    };
  }
  
  export interface CatalogQueryResponse {
    products: {
      nodes: WCProduct[];
    };
  }