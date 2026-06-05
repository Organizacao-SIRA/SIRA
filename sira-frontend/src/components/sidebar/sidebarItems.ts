import { Library, Sparkles, Bookmark, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  id: string;
  path: string;
  labelKey: string;
  icon: LucideIcon;
  authRequired?: boolean;
  /** Rotas extras que mantêm este item ativo (ex.: /buscar é parte da home). */
  matchPaths?: string[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'catalog',   path: '/catalogo',  labelKey: 'items.catalog',   icon: Library  },
  { id: 'home',      path: '/',          labelKey: 'items.home',      icon: Sparkles, matchPaths: ['/buscar'] },
  { id: 'favorites', path: '/favoritos', labelKey: 'items.favorites', icon: Bookmark },
  { id: 'profile',   path: '/perfil',    labelKey: 'items.profile',   icon: Settings, authRequired: true },
];
