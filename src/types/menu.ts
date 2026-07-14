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

export interface NavMenuItem {
  id: string;
  label: string;
  url: string | null;
  path: string | null;
  parentId: string | null;
  children: NavMenuItem[];
  /** Ruta interna de la SPA (`RouterLink`) o `null` si es enlace externo. */
  internalTo: string | null;
  /** Href absoluto/relativo para anclas `<a>`. */
  externalHref: string | null;
}
