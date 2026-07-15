import { gql } from 'graphql-request';
import type { Router } from 'vue-router';
import { graphQLClient } from './client';
import type {
  FooterColumn,
  MenuItem,
  MenuItemsQueryResponse,
  MenuLocation,
  MenusBySlugQueryResponse,
  NavMenuItem,
  WpMenuItemNode,
} from '../types/menu';

const GET_MENU_ITEMS_BY_LOCATION = gql`
  query GetMenuItemsByLocation($location: MenuLocationEnum!) {
    menuItems(where: { location: $location }, first: 100) {
      nodes {
        id
        label
        url
        path
        parentId
        footerSvg
        isMap
      }
    }
  }
`;

const GET_FOOTER_MENU_ITEMS = gql`
  query GetFooterMenuItems {
    menuItems(where: { location: FOOTER }, first: 100) {
      nodes {
        id
        label
        url
        path
        parentId
        footerSvg
        isMap
      }
    }
  }
`;

const GET_MENU_BY_SLUG = gql`
  query GetMenuBySlug($slug: String!) {
    menus(where: { slug: $slug }, first: 1) {
      nodes {
        menuItems(first: 100) {
          nodes {
            id
            label
            url
            path
            parentId
            footerSvg
            isMap
          }
        }
      }
    }
  }
`;

const MAIN_NAV_SLUG = 'main-nav';

const isHashOrEmpty = (raw: string | null | undefined): boolean => {
  const trimmed = raw?.trim() ?? '';
  return trimmed === '' || trimmed === '#';
};

const normalizePath = (raw: string | null | undefined): string | null => {
  if (!raw || isHashOrEmpty(raw)) return null;

  const trimmed = raw.trim();

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const parsed = new URL(trimmed);
      const pathname = parsed.pathname || '/';
      return `${pathname}${parsed.search}${parsed.hash}` || '/';
    }
  } catch {
    return null;
  }

  if (trimmed.startsWith('//')) return null;
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
};

const isSpaPath = (path: string, router: Router): boolean => {
  try {
    return router.resolve(path).matched.length > 0;
  } catch {
    return false;
  }
};

export const resolveLinkTargets = (
  item: Pick<WpMenuItemNode, 'url' | 'path'>,
  router: Router,
): Pick<MenuItem, 'internalTo' | 'externalHref'> => {
  if (isHashOrEmpty(item.path) && isHashOrEmpty(item.url)) {
    return {
      internalTo: null,
      externalHref: '#',
    };
  }

  const fromPath = normalizePath(item.path);
  const fromUrl = normalizePath(item.url);
  const candidate = fromPath ?? fromUrl;

  if (candidate && isSpaPath(candidate, router)) {
    return {
      internalTo: candidate,
      externalHref: null,
    };
  }

  const href = !isHashOrEmpty(item.url)
    ? item.url!.trim()
    : fromPath || '#';

  return {
    internalTo: null,
    externalHref: href,
  };
};

const normalizeFooterSvg = (raw: string | null | undefined): string | null => {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed || trimmed === '#') {
    return null;
  }

  try {
    // Valida URLs absolutas; rutas relativas del media library también se aceptan.
    if (/^https?:\/\//i.test(trimmed)) {
      new URL(trimmed);
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return trimmed;
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * Asegura `output=embed` en la URL del mapa para compatibilidad con iframes
 * (evita bloqueos por políticas X-Frame-Options en vistas normales de Maps).
 */
export const buildMapEmbedSrc = (rawUrl: string | null | undefined): string | null => {
  const trimmed = rawUrl?.trim() ?? '';
  if (!trimmed || trimmed === '#') {
    return null;
  }

  if (/[?&]output=embed(?:&|#|$)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.includes('?')) {
    return `${trimmed}&output=embed`;
  }

  return `${trimmed}?output=embed`;
};

const toMenuItem = (node: WpMenuItemNode, router: Router): MenuItem => {
  const isMap = node.isMap === true;
  const targets = resolveLinkTargets(node, router);
  const mapSource = node.url?.trim() || node.path?.trim() || null;

  return {
    id: node.id,
    label: node.label,
    url: node.url,
    path: node.path,
    parentId: node.parentId,
    footerSvg: normalizeFooterSvg(node.footerSvg),
    isMap,
    internalTo: targets.internalTo,
    externalHref: targets.externalHref,
    mapEmbedSrc: isMap ? buildMapEmbedSrc(mapSource) : null,
  };
};

const isRootParentId = (parentId: string | null | undefined): boolean =>
  parentId === null || parentId === undefined || parentId === '';

/** Construye un árbol padre → hijos a partir de la lista plana de WPGraphQL. */
export const buildMenuTree = (nodes: WpMenuItemNode[], router: Router): NavMenuItem[] => {
  const byId = new Map<string, NavMenuItem>();

  for (const node of nodes) {
    byId.set(node.id, {
      ...toMenuItem(node, router),
      children: [],
    });
  }

  const roots: NavMenuItem[] = [];

  for (const item of byId.values()) {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)!.children.push(item);
    } else {
      roots.push(item);
    }
  }

  return roots;
};

/**
 * Columnas del footer: raíces = títulos; hijos = enlaces de cada columna.
 */
export const buildFooterColumns = (nodes: WpMenuItemNode[], router: Router): FooterColumn[] => {
  const byId = new Map<string, MenuItem>();
  const childrenByParent = new Map<string, MenuItem[]>();

  for (const node of nodes) {
    byId.set(node.id, toMenuItem(node, router));
  }

  for (const item of byId.values()) {
    if (isRootParentId(item.parentId)) {
      continue;
    }

    const parentKey = item.parentId as string;
    const siblings = childrenByParent.get(parentKey) ?? [];
    siblings.push(item);
    childrenByParent.set(parentKey, siblings);
  }

  const columns: FooterColumn[] = [];

  for (const item of byId.values()) {
    if (!isRootParentId(item.parentId)) {
      continue;
    }

    columns.push({
      id: item.id,
      title: item.label,
      links: childrenByParent.get(item.id) ?? [],
    });
  }

  return columns;
};

export const fetchMenuItemsByLocation = async (
  location: MenuLocation,
): Promise<WpMenuItemNode[]> => {
  const response = await graphQLClient.request<MenuItemsQueryResponse>(GET_MENU_ITEMS_BY_LOCATION, {
    location,
  });
  return response.menuItems?.nodes ?? [];
};

const fetchPrimaryMenuNodes = async (): Promise<WpMenuItemNode[]> => {
  try {
    const primaryNodes = await fetchMenuItemsByLocation('PRIMARY');
    if (primaryNodes.length > 0) {
      return primaryNodes;
    }
  } catch (error) {
    console.warn('[Menu] Falló la query por ubicación PRIMARY:', error);
  }

  try {
    const bySlug = await graphQLClient.request<MenusBySlugQueryResponse>(GET_MENU_BY_SLUG, {
      slug: MAIN_NAV_SLUG,
    });
    return bySlug.menus?.nodes?.[0]?.menuItems?.nodes ?? [];
  } catch (error) {
    console.warn('[Menu] Falló la query por slug main-nav:', error);
    return [];
  }
};

export const fetchPrimaryNavMenu = async (router: Router): Promise<NavMenuItem[]> => {
  const nodes = await fetchPrimaryMenuNodes();
  return buildMenuTree(nodes, router);
};

export const fetchFooterMenuNodes = async (): Promise<WpMenuItemNode[]> => {
  try {
    const response = await graphQLClient.request<MenuItemsQueryResponse>(GET_FOOTER_MENU_ITEMS);
    return response.menuItems?.nodes ?? [];
  } catch (error) {
    console.warn('[Menu] Falló la query por ubicación FOOTER:', error);
    return [];
  }
};
