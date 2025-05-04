import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

// Default settings as a fallback when database operations fail
const DEFAULT_CALENDAR_SETTINGS = {
  defaultReminders: [10, 60],
  defaultCalendarId: 'primary',
  syncWorkOrders: true,
  syncMilestones: true,
  syncTimeEntries: false,
  syncContacts: true,
  notifyOnCreation: true,
  notifyOnUpdates: false,
};

// Global settings UUID - using a fixed UUID for global application settings
const GLOBAL_SETTINGS_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Get global settings for a specific module
 * @param module The settings module name (e.g. 'calendar', 'notifications')
 * @returns The settings object for the specified module
 */
export async function getGlobalSettings(category?: string) {
  try {
    // Try to get settings from localStorage
    const settingsJson = localStorage.getItem('app_settings');
    const settings = settingsJson ? JSON.parse(settingsJson) : {};

    // If category is specified, only return that category's settings
    if (category) {
      // Return default settings for calendar if not found
      if (category === 'calendar' && !settings[category]) {
        return { [category]: DEFAULT_CALENDAR_SETTINGS };
      }

      return {
        [category]: settings[category] || {},
      };
    }

    // For calendar, ensure we return defaults if not found
    if (!settings.calendar) {
      settings.calendar = DEFAULT_CALENDAR_SETTINGS;
    }

    return settings;
  } catch (error) {
    console.error('Error fetching global settings:', error);

    // Return default calendar settings on error
    if (category === 'calendar') {
      return { [category]: DEFAULT_CALENDAR_SETTINGS };
    }

    return {};
  }
}

/**
 * Update global settings for a specific module
 * @param module The settings module name (e.g. 'calendar', 'notifications')
 * @param settings The settings object to save
 */
export async function updateGlobalSettings(category: string, value: any) {
  try {
    // First, get current settings to merge with new ones
    const settingsJson = localStorage.getItem('app_settings');
    const currentSettings = settingsJson ? JSON.parse(settingsJson) : {};

    // Merge new settings for the specified category
    const updatedSettings = {
      ...currentSettings,
      [category]: value,
    };

    // Save to localStorage
    localStorage.setItem('app_settings', JSON.stringify(updatedSettings));

    return updatedSettings;
  } catch (error) {
    console.error('Error updating global settings:', error);
    throw error;
  }
}

/**
 * Get a specific setting value for a module
 * @param module The settings module name
 * @param key The specific setting key
 * @param defaultValue Default value if setting doesn't exist
 */
export async function getSetting<T>(module: string, key: string, defaultValue: T): Promise<T> {
  try {
    const settings = await getGlobalSettings(module);
    if (!settings || !settings[module]) {
      return defaultValue;
    }

    return settings[module][key] !== undefined ? settings[module][key] : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${module}.${key}:`, error);
    return defaultValue;
  }
}

export async function getUserSettings(userId: string, category?: string) {
  // This would be implemented to retrieve user-specific settings
  // For now, we're just using global settings
  return getGlobalSettings(category);
}

export async function updateUserSettings(userId: string, category: string, value: any) {
  // This would be implemented to update user-specific settings
  // For now, we're just using global settings
  return updateGlobalSettings(category, value);
}
