export interface WpMenuItemNode {
  id: string;
  label: string;
  url: string | null;
  path: string | null;
  parentId: string | null;
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

/** Elemento de menú normalizado para el frontend (sin `any`). */
export interface MenuItem {
  id: string;
  label: string;
  url: string | null;
  path: string | null;
  parentId: string | null;
  /** Ruta interna de la SPA (`RouterLink`) o `null` si es enlace externo / `#`. */
  internalTo: string | null;
  /** Href para etiquetas `<a>` (externos o `#`). */
  externalHref: string | null;
}

export interface NavMenuItem extends MenuItem {
  children: NavMenuItem[];
}

/** Columna del footer: raíz = título, hijos = enlaces. */
export interface FooterColumn {
  id: string;
  title: string;
  links: MenuItem[];
}

export type MenuLocation = 'PRIMARY' | 'FOOTER';
