
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export interface ActionItem {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: React.ReactNode;
  className?: string;
}

export interface ActionGroup {
  items: ActionItem[];
}

interface ActionMenuProps {
  groups: ActionGroup[];
  align?: 'start' | 'center' | 'end';
}

const ActionMenu = ({ groups, align = 'end' }: ActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        {groups.map((group, groupIndex) => (
          <React.Fragment key={`group-${groupIndex}`}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            {group.items.map((item, itemIndex) => (
              <DropdownMenuItem
                key={`item-${groupIndex}-${itemIndex}`}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick(e);
                }}
                className={item.className}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </DropdownMenuItem>
            ))}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionMenu;
