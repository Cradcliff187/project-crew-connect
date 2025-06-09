const { google } = require('googleapis');
const path = require('path');

class ServiceAccountAuth {
  constructor() {
    this.auth = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      // Option 1: From base64 encoded env var (recommended for production)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
        console.log('[Service Account] Initializing from base64 environment variable');
        const keyJson = Buffer.from(
          process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64,
          'base64'
        ).toString('utf-8');
        const key = JSON.parse(keyJson);

        this.auth = new google.auth.GoogleAuth({
          credentials: key,
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ],
        });
      }
      // Option 1.5: From raw JSON env var (for backward compatibility)
      else if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
        console.log('[Service Account] Initializing from JSON environment variable');
        const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

        this.auth = new google.auth.GoogleAuth({
          credentials: key,
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ],
        });
      }
      // Option 2: From file path (for local development)
      else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
        console.log('[Service Account] Initializing from file path');
        this.auth = new google.auth.GoogleAuth({
          keyFilename: path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE),
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ],
        });
      } else {
        console.warn('[Service Account] No service account credentials configured');
        return false;
      }

      // Test the credentials
      const client = await this.auth.getClient();
      await client.getAccessToken();

      this.initialized = true;
      console.log('[Service Account] ✓ Service account initialized successfully');
      return true;
    } catch (error) {
      console.error('[Service Account] ✗ Failed to initialize:', error.message);
      return false;
    }
  }

  async getClient() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.auth) {
      throw new Error('Service account not initialized');
    }

    return await this.auth.getClient();
  }

  isInitialized() {
    return this.initialized;
  }
}

// Export singleton instance
module.exports = new ServiceAccountAuth();
