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
            ? 'bg-primary-soft dark:bg-primary/30 text-primary dark:text-white border-primary dark:border-blue-300'
            : 'text-text hover:bg-surface-subtle dark:hover:bg-white/5 border-transparent'
          }
        `}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary dark:text-white' : 'text-text-subtle dark:text-text-muted'}`} />

        <span className={`
          whitespace-nowrap overflow-hidden transition-all duration-300
          ${isExpanded ? 'opacity-100 max-w-xs ml-3' : 'opacity-0 max-w-0 ml-0'}
        `}>
          {label}
        </span>
      </button>
    </li>
  );
};
