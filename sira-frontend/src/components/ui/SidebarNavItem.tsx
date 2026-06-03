import { useTranslation } from 'react-i18next';
import type { SidebarItem } from '../sidebar/sidebarItems';

interface SidebarNavItemProps {
  item: SidebarItem;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

export const SidebarNavItem = ({ item, isActive, isExpanded, onClick }: SidebarNavItemProps) => {
  const { t } = useTranslation('navigation');
  const Icon = item.icon;
  const label = t(item.labelKey);

  return (
    <li>
      <button
        onClick={onClick}
        aria-label={label}
        title={!isExpanded ? label : undefined}
        className={`
          w-full flex items-center pl-5 pr-2 py-3 text-sm font-medium
          transition-colors cursor-pointer border-l-4
          ${isActive
            ? 'bg-selected text-link border-selected-border'
            : 'text-text hover:bg-surface-subtle hover:text-link border-transparent'
          }
        `}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-link' : 'text-text-subtle'}`} />

        <span className={`
          whitespace-nowrap overflow-hidden transition-[opacity,max-width,margin] duration-200
          ${isExpanded ? 'opacity-100 max-w-xs ml-3' : 'opacity-100 max-w-xs ml-3 md:opacity-0 md:max-w-0 md:ml-0'}
        `}>
          {label}
        </span>
      </button>
    </li>
  );
};
