// Script to automatically set up deployment environment variables
const crypto = require('crypto');

console.log('🚀 AKC CRM Deployment Environment Setup\n');

// Generate secure session secret
const sessionSecret = crypto.randomBytes(64).toString('hex');
console.log('✅ Generated secure SESSION_SECRET');

// Production URL
const productionUrl = 'https://project-crew-connect-1061142868787.us-east5.run.app';

// Environment variables for production
const envVars = {
  // Google OAuth (from env-template.txt)
  GOOGLE_CLIENT_ID: '1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: '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',
  GOOGLE_REDIRECT_URI: `${productionUrl}/auth/google/callback`,

  // Session
  SESSION_SECRET: sessionSecret,

  // Supabase (from env-template.txt)
  SUPABASE_URL: 'https://zrxezqllmpdlhiudutme.supabase.co',
  SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ',
  SUPABASE_SERVICE_ROLE_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY',

  // Production mode
  NODE_ENV: 'production',

  // Google Maps API Key (if you have one)
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
};

// Generate gcloud command
console.log('\n📋 Copy and run this command to set all environment variables:\n');

const envVarFlags = Object.entries(envVars)
  .filter(([key, value]) => value) // Skip empty values
  .map(([key, value]) => `--set-env-vars="${key}=${value}"`)
  .join(' \\\n  ');

const gcloudCommand = `gcloud run services update project-crew-connect \\
  ${envVarFlags} \\
  --region us-east5`;

console.log(gcloudCommand);

// Also generate a .env.production file for local testing
const fs = require('fs');
const envContent = Object.entries(envVars)
  .filter(([key, value]) => value)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync('.env.production', envContent);
console.log('\n✅ Created .env.production file for local testing');

// Create a deployment checklist
console.log('\n📝 Deployment Checklist:');
console.log('1. ✅ Environment variables prepared');
console.log('2. ✅ Session secret generated');
console.log('3. ✅ Google OAuth credentials configured');
console.log('4. ⏳ Run the gcloud command above');
console.log('5. ⏳ Deploy the application');

console.log('\n⚠️  Important Notes:');
console.log('- The SESSION_SECRET has been randomly generated and is secure');
console.log('- Google OAuth redirect URI has been updated for production');
console.log('- Make sure to keep the .env.production file secure and never commit it');

console.log('\n🎯 Next Step: Copy and run the gcloud command above!');
