
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EntityType } from '@/types/reports';
import { entityNames, entityIcons } from '@/data/reportEntities';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReportSidebarProps {
  selectedEntity: EntityType;
  onSelectEntity: (entity: EntityType) => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const ReportSidebar = ({
  selectedEntity,
  onSelectEntity,
  sidebarCollapsed,
  onToggleSidebar
}: ReportSidebarProps) => {
  return (
    <div className={cn(
      "transition-all duration-300 ease-in-out bg-white border-r shadow-sm", 
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex justify-between items-center p-4 border-b">
        {!sidebarCollapsed && <h3 className="font-medium">Report Types</h3>}
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto" 
          onClick={onToggleSidebar}
        >
          {sidebarCollapsed ? 
            <ChevronRight className="h-4 w-4" /> : 
            <ChevronLeft className="h-4 w-4" />
          }
        </Button>
      </div>
      <ScrollArea className="h-[70vh]">
        <div className="space-y-1 p-2">
          {(Object.keys(entityNames) as EntityType[]).map((entity) => (
            <Button
              key={entity}
              variant={selectedEntity === entity ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                sidebarCollapsed ? "px-2 py-2" : "px-4 py-2"
              )}
              onClick={() => onSelectEntity(entity)}
            >
              <span className="mr-2">{entityIcons[entity]}</span>
              {!sidebarCollapsed && <span>{entityNames[entity]}</span>}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ReportSidebar;
