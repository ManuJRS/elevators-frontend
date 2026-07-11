import type { ProductAttribute, ProductCategory, ProductImage, VariationAttribute } from './product';

export interface AcfMediaFile {
  mediaItemUrl: string | null;
  title: string | null;
}

export interface TechnicalFields {
  manualPdf: AcfMediaFile | null;
  installationDiagram: AcfMediaFile | null;
  securityCertification: AcfMediaFile | null;
}

export interface DetailProductVariation {
  id: string;
  databaseId: number;
  name: string;
  sku: string | null;
  price: string;
  stockQuantity: number | null;
  manageStock: boolean | null;
  image: ProductImage | null;
  attributes?: {
    nodes: VariationAttribute[];
  };
}

export interface SpecificationRow {
  key: string;
  label: string;
  value: string;
}

export interface DownloadResource {
  key: string;
  label: string;
  url: string;
}

export interface SingleProduct {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  shortDescription: string;
  image: ProductImage | null;
  productCategories?: {
    nodes: ProductCategory[];
  };
  attributes?: {
    nodes: ProductAttribute[];
  };
  variations?: {
    nodes: DetailProductVariation[];
  };
  acfTechnicalData: TechnicalFields | null;
}

export interface SingleProductQueryResponse {
  product: SingleProduct | null;
}

export type ProductDetailTab = 'description' | 'specifications' | 'downloads';
