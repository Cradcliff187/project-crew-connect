import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export interface ActionItem {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  hoverContent?: React.ReactNode;
}

export interface ActionGroup {
  items: ActionItem[];
  label?: string;
}

interface ActionMenuProps {
  groups: ActionGroup[];
  align?: 'start' | 'center' | 'end';
  size?: 'default' | 'sm';
  variant?: 'ghost' | 'outline';
  triggerClassName?: string;
}

const ActionMenu = ({
  groups,
  align = 'end',
  size = 'default',
  variant = 'ghost',
  triggerClassName,
}: ActionMenuProps) => {
  const buttonSize = size === 'default' ? 'icon' : 'icon-sm';
  const buttonClasses = size === 'default' ? 'h-8 w-8' : 'h-6 w-6';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={buttonSize as any}
          className={`${buttonClasses} ${triggerClassName || ''}`}
        >
          <MoreHorizontal className={size === 'default' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        {groups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            {group.items.map((item, itemIndex) => {
              // Create a unique key for each item
              const itemKey = `item-${groupIndex}-${itemIndex}`;

              return item.hoverContent ? (
                <HoverCard key={itemKey}>
                  <HoverCardTrigger asChild>
                    <DropdownMenuItem
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        item.onClick(e);
                      }}
                      className={item.className}
                      disabled={item.disabled}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </DropdownMenuItem>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-4">{item.hoverContent}</HoverCardContent>
                </HoverCard>
              ) : (
                <DropdownMenuItem
                  key={itemKey}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    item.onClick(e);
                  }}
                  className={item.className}
                  disabled={item.disabled}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionMenu;
