import React, { useState, useEffect } from 'react';
import { Calendar, Info, Trash, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { getGlobalSettings } from '@/services/userSettings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

export interface GoogleCalendarSettings {
  defaultReminders: number[];
  defaultCalendarId: string;
  syncWorkOrders: boolean;
  syncMilestones: boolean;
  syncTimeEntries: boolean;
  syncContacts: boolean;
  notifyOnCreation: boolean;
  notifyOnUpdates: boolean;
}

const defaultSettings: GoogleCalendarSettings = {
  defaultReminders: [10, 60],
  defaultCalendarId: 'primary',
  syncWorkOrders: true,
  syncMilestones: true,
  syncTimeEntries: false,
  syncContacts: true,
  notifyOnCreation: true,
  notifyOnUpdates: false,
};

function GoogleCalendarSettingsComponent() {
  const { isAuthenticated, login, logout, userInfo, calendars, refreshCalendars } =
    useGoogleCalendar();
  const [settings, setSettings] = useState<GoogleCalendarSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const userSettings = await getGlobalSettings('calendar');
        if (userSettings?.calendar) {
          setSettings(userSettings.calendar);
        }

        // Get last sync info
        const { data, error } = await supabase.rpc('get_last_calendar_sync_info');
        if (data && !error) {
          setLastSyncTime(data.last_sync_time);
        }
      } catch (error) {
        console.error('Error loading calendar settings:', error);
        toast({
          title: 'Failed to load settings',
          description: 'There was an error loading your calendar settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Load calendars when authenticated
  useEffect(() => {
    if (isAuthenticated && !calendars.length) {
      refreshCalendars();
    }
  }, [isAuthenticated, calendars.length, refreshCalendars]);

  const handleSyncCalendars = async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const { data, error } = await supabase.rpc('sync_google_calendars');

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: 'Calendars synchronized',
        description: 'Your calendars have been successfully synchronized.',
      });

      // Update last sync time
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error('Error syncing calendars:', error);
      setSyncError(
        typeof error === 'string' ? error : (error as Error).message || 'Unknown error occurred'
      );
      toast({
        title: 'Sync failed',
        description: 'There was an error synchronizing your calendars.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatReminderTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes === 60) {
      return '1 hour';
    } else if (minutes % 60 === 0) {
      return `${minutes / 60} hours`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" /> Google Calendar Integration
            </CardTitle>
            <CardDescription>View and manage your Google Calendar connection</CardDescription>
          </div>
          <Badge variant={isAuthenticated ? 'default' : 'outline'} className="ml-2">
            {isAuthenticated ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {isAuthenticated ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isAuthenticated ? (
          <div className="rounded-md bg-blue-50 p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-blue-800">Connect Google Calendar</h3>
            <p className="mt-2 text-blue-600 mb-4">
              Connect your Google Calendar to sync project milestones, work orders, meetings, and
              time entries.
            </p>
            <Button onClick={() => login()} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Connect to Google Calendar
            </Button>
          </div>
        ) : (
          <>
            {syncError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sync Error</AlertTitle>
                <AlertDescription>{syncError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Connected Account</h3>
                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center">
                    {userInfo?.picture && (
                      <img
                        src={userInfo.picture}
                        alt={userInfo.name}
                        className="h-8 w-8 rounded-full mr-2"
                      />
                    )}
                    <div>
                      <p className="font-medium">{userInfo?.name}</p>
                      <p className="text-sm text-muted-foreground">{userInfo?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logout()}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium mb-2">Sync Status</h3>
                <div className="bg-gray-50 rounded-md p-4 border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Last synced: {formatDate(lastSyncTime)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sync your calendars to update events and ensure everything is in sync
                      </p>
                    </div>
                    <Button
                      onClick={handleSyncCalendars}
                      disabled={isLoading || isSyncing}
                      className="bg-[#0485ea] hover:bg-[#0375d1]"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Connection
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Default Calendar</h3>
                <Select value={settings.defaultCalendarId} disabled={true}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a calendar" />
                  </SelectTrigger>
                </Select>
                <div className="flex mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshCalendars()}
                    className="text-xs"
                    disabled={!isAuthenticated || isLoading}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh Calendars
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Default Reminders</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {settings.defaultReminders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No default reminders configured</p>
                  ) : (
                    settings.defaultReminders.map(minutes => (
                      <Badge key={minutes} variant="secondary" className="flex items-center gap-1">
                        {formatReminderTime(minutes)}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Sync Settings</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sync Work Orders</p>
                    <p className="text-sm text-muted-foreground">
                      Add work orders to your calendar
                    </p>
                  </div>
                  <Switch checked={settings.syncWorkOrders} disabled={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sync Project Milestones</p>
                    <p className="text-sm text-muted-foreground">
                      Add project milestones to your calendar
                    </p>
                  </div>
                  <Switch checked={settings.syncMilestones} disabled={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sync Time Entries</p>
                    <p className="text-sm text-muted-foreground">
                      Add your work time blocks to your calendar
                    </p>
                  </div>
                  <Switch checked={settings.syncTimeEntries} disabled={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sync Contact Meetings</p>
                    <p className="text-sm text-muted-foreground">
                      Add contact interactions to your calendar
                    </p>
                  </div>
                  <Switch checked={settings.syncContacts} disabled={true} />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Settings can only be modified by administrators
        </p>
        {isAuthenticated && (
          <Button
            onClick={handleSyncCalendars}
            disabled={isLoading || isSyncing}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Connection
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default GoogleCalendarSettingsComponent;
