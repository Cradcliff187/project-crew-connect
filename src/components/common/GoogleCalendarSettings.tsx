import React, { useState, useEffect } from 'react';
import { Calendar, Info, Trash, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
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
import { getGlobalSettings, updateGlobalSettings } from '@/services/userSettings';

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

export default function GoogleCalendarSettings() {
  const { isAuthenticated, login, logout, userInfo, calendars, refreshCalendars } =
    useGoogleCalendar();
  const [settings, setSettings] = useState<GoogleCalendarSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newReminder, setNewReminder] = useState('');

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const userSettings = await getGlobalSettings('calendar');
        if (userSettings?.calendar) {
          setSettings(userSettings.calendar);
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

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateGlobalSettings('calendar', settings);
      toast({
        title: 'Settings saved',
        description: 'Your calendar settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      toast({
        title: 'Failed to save settings',
        description: 'There was an error saving your calendar settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddReminder = () => {
    const minutes = parseInt(newReminder, 10);
    if (!isNaN(minutes) && minutes > 0) {
      if (!settings.defaultReminders.includes(minutes)) {
        setSettings({
          ...settings,
          defaultReminders: [...settings.defaultReminders, minutes].sort((a, b) => a - b),
        });
        setNewReminder('');
      } else {
        toast({
          title: 'Duplicate reminder',
          description: 'This reminder time already exists.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRemoveReminder = (minutes: number) => {
    setSettings({
      ...settings,
      defaultReminders: settings.defaultReminders.filter(m => m !== minutes),
    });
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" /> Google Calendar Integration
            </CardTitle>
            <CardDescription>Configure how your data syncs with Google Calendar</CardDescription>
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

              <div>
                <h3 className="text-sm font-medium mb-2">Default Calendar</h3>
                <Select
                  value={settings.defaultCalendarId}
                  onValueChange={value => setSettings({ ...settings, defaultCalendarId: value })}
                  disabled={!isAuthenticated || isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendars.map(calendar => (
                      <SelectItem key={calendar.id} value={calendar.id}>
                        {calendar.summary}
                      </SelectItem>
                    ))}
                  </SelectContent>
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
                        <button
                          onClick={() => handleRemoveReminder(minutes)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Minutes before event"
                    className="w-40"
                    value={newReminder}
                    onChange={e => setNewReminder(e.target.value)}
                    min="1"
                  />
                  <Button variant="outline" size="sm" onClick={handleAddReminder}>
                    Add Reminder
                  </Button>
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
                  <Switch
                    checked={settings.syncWorkOrders}
                    onCheckedChange={checked =>
                      setSettings({ ...settings, syncWorkOrders: checked })
                    }
                    disabled={!isAuthenticated || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sync Project Milestones</p>
                    <p className="text-sm text-muted-foreground">
                      Add project milestones to your calendar
                    </p>
                  </div>
                  <Switch
                    checked={settings.syncMilestones}
                    onCheckedChange={checked =>
                      setSettings({ ...settings, syncMilestones: checked })
                    }
                    disabled={!isAuthenticated || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sync Time Entries</p>
                    <p className="text-sm text-muted-foreground">
                      Add your work time blocks to your calendar
                    </p>
                  </div>
                  <Switch
                    checked={settings.syncTimeEntries}
                    onCheckedChange={checked =>
                      setSettings({ ...settings, syncTimeEntries: checked })
                    }
                    disabled={!isAuthenticated || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sync Contact Meetings</p>
                    <p className="text-sm text-muted-foreground">
                      Add contact interactions to your calendar
                    </p>
                  </div>
                  <Switch
                    checked={settings.syncContacts}
                    onCheckedChange={checked => setSettings({ ...settings, syncContacts: checked })}
                    disabled={!isAuthenticated || isLoading}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Send Notifications on Creation</p>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications when calendar events are created
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifyOnCreation}
                    onCheckedChange={checked =>
                      setSettings({ ...settings, notifyOnCreation: checked })
                    }
                    disabled={!isAuthenticated || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Send Notifications on Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications when calendar events are updated
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifyOnUpdates}
                    onCheckedChange={checked =>
                      setSettings({ ...settings, notifyOnUpdates: checked })
                    }
                    disabled={!isAuthenticated || isLoading}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={!isAuthenticated || isLoading || isSaving}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}
