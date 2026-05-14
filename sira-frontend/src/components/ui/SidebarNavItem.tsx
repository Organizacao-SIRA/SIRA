import type { SidebarItem } from '../sidebar/sidebarItems';

interface SidebarNavItemProps {
  item: SidebarItem;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

export const SidebarNavItem = ({ item, isActive, isExpanded, onClick }: SidebarNavItemProps) => {
  const Icon = item.icon;

  return (
    <li>
      <button
        onClick={onClick}
        aria-label={item.label}
        title={!isExpanded ? item.label : undefined}
        className={`
          w-full flex items-center pl-5 pr-2 py-3 text-sm font-medium
          transition-colors cursor-pointer border-l-4
          ${isActive
            ? 'bg-primary-soft text-primary border-primary'
            : 'text-text hover:bg-surface-subtle border-transparent'
          }
        `}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-text-subtle'}`} />

        <span className={`
          whitespace-nowrap overflow-hidden transition-all duration-300
          ${isExpanded ? 'opacity-100 max-w-xs ml-3' : 'opacity-0 max-w-0 ml-0'}
        `}>
          {item.label}
        </span>
      </button>
    </li>
  );
};
