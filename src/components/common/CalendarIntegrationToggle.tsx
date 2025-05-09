import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { getGlobalSettings } from '@/services/userSettings';

interface CalendarIntegrationToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
  label?: string;
  description?: string;
  entityType?: 'project_milestone' | 'work_order' | 'contact_interaction' | 'time_entry';
}

const defaultSettings = {
  syncWorkOrders: true,
  syncMilestones: true,
  syncTimeEntries: false,
  syncContacts: true,
};

/**
 * A reusable component for Google Calendar integration toggles.
 * Shows a toggle switch with appropriate labeling and status indicators.
 */
export function CalendarIntegrationToggle({
  value,
  onChange,
  disabled = false,
  disabledReason,
  label = 'Google Calendar Integration',
  description = 'Add this item to your Google Calendar',
  entityType,
}: CalendarIntegrationToggleProps) {
  const { isAuthenticated } = useGoogleCalendar();
  const [globalSettings, setGlobalSettings] = useState(defaultSettings);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(true);

  // Load global settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getGlobalSettings('calendar');
        if (settings?.calendar) {
          setGlobalSettings(settings.calendar);

          // Check if this entity type is enabled in global settings
          if (entityType) {
            switch (entityType) {
              case 'project_milestone':
                setIsFeatureEnabled(settings.calendar.syncMilestones !== false);
                break;
              case 'work_order':
                setIsFeatureEnabled(settings.calendar.syncWorkOrders !== false);
                break;
              case 'time_entry':
                setIsFeatureEnabled(settings.calendar.syncTimeEntries !== false);
                break;
              case 'contact_interaction':
                setIsFeatureEnabled(settings.calendar.syncContacts !== false);
                break;
              default:
                setIsFeatureEnabled(true);
            }
          }
        }
      } catch (error) {
        console.error('Error loading calendar settings:', error);
      }
    };

    loadSettings();
  }, [entityType]);

  // If feature is disabled in global settings, don't render
  if (entityType && !isFeatureEnabled) {
    return null;
  }

  return (
    <div className="border p-4 rounded-md mt-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="calendar-sync" className="text-base font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-1.5" />
            {label}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {!isAuthenticated && (
            <p className="text-xs text-amber-500 mt-1">Google Calendar not connected</p>
          )}
        </div>
        <Switch
          id="calendar-sync"
          checked={value}
          onCheckedChange={onChange}
          disabled={!isAuthenticated || disabled}
        />
      </div>

      {/* Show warning if calendar sync is enabled but required condition is not met */}
      {value && disabled && disabledReason && (
        <p className="text-sm text-destructive mt-2">{disabledReason}</p>
      )}

      {/* Show warning if not authenticated */}
      {value && !isAuthenticated && (
        <div className="mt-2 p-3 border border-amber-200 bg-amber-50 rounded-md">
          <p className="text-sm text-amber-700">
            You need to connect your Google Calendar in{' '}
            <a href="/settings?tab=calendar" className="underline font-medium">
              Settings
            </a>{' '}
            first.
          </p>
        </div>
      )}
    </div>
  );
}
