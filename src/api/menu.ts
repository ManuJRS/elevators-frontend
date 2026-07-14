import { gql } from 'graphql-request';
import type { Router } from 'vue-router';
import { graphQLClient } from './client';
import type {
  MenuItemsQueryResponse,
  MenusBySlugQueryResponse,
  NavMenuItem,
  WpMenuItemNode,
} from '../types/menu';

const GET_PRIMARY_MENU_ITEMS = gql`
  query GetPrimaryMenuItems {
    menuItems(where: { location: PRIMARY }, first: 100) {
      nodes {
        id
        label
        url
        path
        parentId
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
          }
        }
      }
    }
  }
`;

const MAIN_NAV_SLUG = 'main-nav';

const normalizePath = (raw: string | null | undefined): string | null => {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

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

const resolveLinkTargets = (
  item: WpMenuItemNode,
  router: Router,
): Pick<NavMenuItem, 'internalTo' | 'externalHref'> => {
  const fromPath = normalizePath(item.path);
  const fromUrl = normalizePath(item.url);
  const candidate = fromPath ?? fromUrl;

  if (candidate && isSpaPath(candidate, router)) {
    return {
      internalTo: candidate,
      externalHref: null,
    };
  }

  const href = item.url?.trim() || fromPath || '#';
  return {
    internalTo: null,
    externalHref: href,
  };
};

/** Construye un árbol padre → hijos a partir de la lista plana de WPGraphQL. */
export const buildMenuTree = (nodes: WpMenuItemNode[], router: Router): NavMenuItem[] => {
  const byId = new Map<string, NavMenuItem>();

  for (const node of nodes) {
    const targets = resolveLinkTargets(node, router);
    byId.set(node.id, {
      id: node.id,
      label: node.label,
      url: node.url,
      path: node.path,
      parentId: node.parentId,
      children: [],
      internalTo: targets.internalTo,
      externalHref: targets.externalHref,
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

const fetchMenuNodes = async (): Promise<WpMenuItemNode[]> => {
  try {
    const primary = await graphQLClient.request<MenuItemsQueryResponse>(GET_PRIMARY_MENU_ITEMS);
    const primaryNodes = primary.menuItems?.nodes ?? [];
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
  const nodes = await fetchMenuNodes();
  return buildMenuTree(nodes, router);
};
