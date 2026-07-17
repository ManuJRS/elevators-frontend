export interface WpMenuItemNode {
  id: string;
  label: string;
  url: string | null;
  path: string | null;
  parentId: string | null;
  /** URL del SVG personalizado ACF (puede ser `null`). */
  footerSvg: string | null;
  /** Si es `true`, el subelemento se renderiza como mapa embebido (`iframe`). */
  isMap: boolean;
}

export interface MenuItemsQueryResponse {
  menuItems: {
    nodes: WpMenuItemNode[];
  };
}

export interface MenusBySlugQueryResponse {
  menus: {
    nodes: Array<{
      menuItems: {
        nodes: WpMenuItemNode[];
      };
    }>;
  };
}

/** Respuesta del nodo padre del menú FOOTER (ítems + copyright general). */
export interface FooterMenuQueryResponse {
  menus: {
    nodes: Array<{
      copyrightText: string | null;
      menuItems: {
        nodes: WpMenuItemNode[];
      };
    }>;
  };
}

/** Datos consolidados del menú de pie de página. */
export interface FooterMenuData {
  copyrightText: string;
  nodes: WpMenuItemNode[];
}

/** Elemento de menú normalizado para el frontend (sin `any`). */
export interface MenuItem {
  id: string;
  label: string;
  url: string | null;
  path: string | null;
  parentId: string | null;
  footerSvg: string | null;
  isMap: boolean;
  /** Ruta interna de la SPA (`RouterLink`) o `null` si es enlace externo / `#`. */
  internalTo: string | null;
  /** Href para etiquetas `<a>` (externos o `#`). */
  externalHref: string | null;
  /** Src final para `<iframe>` cuando `isMap` es `true`. */
  mapEmbedSrc: string | null;
}

export interface NavMenuItem extends MenuItem {
  children: NavMenuItem[];
}

/** Columna del footer: raíz = título, hijos = enlaces / mapas. */
export interface FooterColumn {
  id: string;
  title: string;
  links: MenuItem[];
}

export type MenuLocation = 'PRIMARY' | 'FOOTER';
