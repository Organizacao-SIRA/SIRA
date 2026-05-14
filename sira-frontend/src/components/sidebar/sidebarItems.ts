import { Library, Sparkles, Bookmark, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  authRequired?: boolean;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'catalog',   label: 'Catálogo de Livros', icon: Library  },
  { id: 'home',      label: 'Recomendações',       icon: Sparkles },
  { id: 'favorites', label: 'Meus Favoritos',      icon: Bookmark },
  { id: 'profile',   label: 'Configurações',       icon: Settings, authRequired: true },
];
