/**
 * Debug utilities for logging and troubleshooting
 */

export function forceConsoleLogging() {
  // Store original console methods
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;

  // Override console methods to ensure they work in all environments
  console.log = function () {
    // Log to original console
    originalConsoleLog.apply(console, arguments);

    // Add visible element to DOM for debugging in case console is not visible
    const logElement = document.createElement('div');
    logElement.style.position = 'fixed';
    logElement.style.bottom = '10px';
    logElement.style.right = '10px';
    logElement.style.zIndex = '9999';
    logElement.style.background = 'rgba(0,0,0,0.8)';
    logElement.style.color = 'white';
    logElement.style.padding = '10px';
    logElement.style.borderRadius = '5px';
    logElement.style.maxWidth = '80%';
    logElement.style.maxHeight = '200px';
    logElement.style.overflow = 'auto';
    logElement.style.fontSize = '12px';
    logElement.textContent = Array.from(arguments)
      .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ');

    document.body.appendChild(logElement);

    // Remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(logElement)) {
        document.body.removeChild(logElement);
      }
    }, 5000);
  };

  // Also override error, warn, and info with similar behavior
  console.error = function () {
    originalConsoleError.apply(console, arguments);
    const args = Array.from(arguments);
    console.log('[ERROR]', ...args);
  };

  console.warn = function () {
    originalConsoleWarn.apply(console, arguments);
    const args = Array.from(arguments);
    console.log('[WARN]', ...args);
  };

  console.info = function () {
    originalConsoleInfo.apply(console, arguments);
    const args = Array.from(arguments);
    console.log('[INFO]', ...args);
  };

  // Also catch unhandled promise rejections
  window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled Promise Rejection:', event.reason);
  });

  // Catch global errors
  window.addEventListener('error', function (event) {
    console.error('Global Error:', event.error || event.message);
  });

  return () => {
    // Function to restore original console behavior
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
  };
}

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
