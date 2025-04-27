/**
 * Debug utilities for logging and troubleshooting
 * Currently all debug logging is DISABLED
 */

// Flag to completely disable all debug logs
const DEBUG_ENABLED = false;

export function forceConsoleLogging() {
  // Debug logging is disabled
  return () => {}; // Return empty cleanup function
}

// Create silent logger functions that do nothing
const silentLogger = (...args: any[]) => {};

// Replace console.log with silent version for debug messages
export const debug = DEBUG_ENABLED ? console.log : silentLogger;

/**
 * Check Supabase connection
 */
export async function checkSupabaseConnection(supabase: any) {
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('estimates').select('estimateid').limit(1);
    const duration = Date.now() - start;

    if (error) {
      return {
        connected: false,
        error: error.message,
        duration,
      };
    }

    return {
      connected: true,
      data,
      duration,
    };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      duration: 0,
    };
  }
}
