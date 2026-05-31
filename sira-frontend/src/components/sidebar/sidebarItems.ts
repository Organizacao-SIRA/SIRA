import { Library, Sparkles, Bookmark, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  authRequired?: boolean;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'catalog',   labelKey: 'items.catalog',   icon: Library  },
  { id: 'home',      labelKey: 'items.home',      icon: Sparkles },
  { id: 'favorites', labelKey: 'items.favorites', icon: Bookmark },
  { id: 'profile',   labelKey: 'items.profile',   icon: Settings, authRequired: true },
];
