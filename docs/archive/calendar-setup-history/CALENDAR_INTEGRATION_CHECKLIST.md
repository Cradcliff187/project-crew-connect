# Calendar Integration Requirements Checklist

## ✅ What You Already Have

Based on your existing setup:

- [x] `GOOGLE_CLIENT_ID` - For OAuth user authentication
- [x] `GOOGLE_CLIENT_SECRET` - For OAuth user authentication
- [x] `SUPABASE_URL` - Your Supabase project URL
- [x] `SUPABASE_ANON_KEY` - Public Supabase key
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Admin Supabase key

## ❌ What You Need to Create/Obtain

### 1. Google Service Account (NEW)

- [ ] **Service Account Email**: `your-service-account@your-project.iam.gserviceaccount.com`
- [ ] **Service Account JSON Key**: Download from Google Cloud Console
- [ ] **Service Account Key (Base64)**: Convert JSON to base64 for env variable

**How to get:**

1. Go to Google Cloud Console → IAM & Admin → Service Accounts
2. Create new service account
3. Download JSON key
4. Convert to base64: `base64 -i service-account-key.json`

### 2. Shared Google Calendars (NEW)

- [ ] **Projects Calendar ID**: `xxxxxxxxxx@group.calendar.google.com`
- [ ] **Work Orders Calendar ID**: `yyyyyyyyyy@group.calendar.google.com`

**How to get:**

1. Create calendars in Google Calendar
2. Go to Settings → Integrate calendar
3. Copy Calendar ID

### 3. Webhook Configuration (NEW)

- [ ] **Webhook URL**: `https://YOUR-PROJECT-REF.supabase.co/functions/v1/calendarWebhook`
- [ ] **Webhook Token**: Generate secure random string (32+ characters)

**How to get:**

1. Webhook URL: Replace YOUR-PROJECT-REF with your Supabase project reference
2. Token: Generate with `openssl rand -hex 32`

### 4. Your Specific Values Needed

Find these values and add to your `.env`:

```env
# Service Account (CREATE NEW)
GOOGLE_SERVICE_ACCOUNT_EMAIL=??? # Will be shown after creating service account
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=??? # Base64 encode the downloaded JSON

# Shared Calendars (CREATE NEW)
VITE_GOOGLE_CALENDAR_PROJECTS=??? # Get from Google Calendar settings
VITE_GOOGLE_CALENDAR_WORK_ORDER=??? # Get from Google Calendar settings

# Webhook Config (GENERATE)
WEBHOOK_URL=https://????.supabase.co/functions/v1/calendarWebhook # Your Supabase project ref
WEBHOOK_TOKEN=???? # Generate random token

# Your Google Cloud Project (FIND)
GOOGLE_CLOUD_PROJECT_ID=???? # From Google Cloud Console
```

## 🔍 Where to Find Missing Info

### Supabase Project Reference

```bash
# If you have Supabase CLI:
supabase projects list

# Or find in Supabase Dashboard:
# Settings → General → Reference ID
```

### Google Cloud Project ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Project ID is shown in the project selector

### Test Your Values

Once you have all values, test with:

```bash
# Test service account
node -e "console.log(JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString()))"

# Should output your service account JSON
```

## 📋 Final Environment Variables

Your complete `.env` should include:

```env
# Existing (you have these)
GOOGLE_CLIENT_ID=your-existing-client-id
GOOGLE_CLIENT_SECRET=your-existing-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# New (you need these)
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<very-long-base64-string>
VITE_GOOGLE_CALENDAR_PROJECTS=abc123@group.calendar.google.com
VITE_GOOGLE_CALENDAR_WORK_ORDER=xyz789@group.calendar.google.com
WEBHOOK_URL=https://your-ref.supabase.co/functions/v1/calendarWebhook
WEBHOOK_TOKEN=your-secure-random-token
```

## 🚨 Important Notes

1. **Never commit these values** to git
2. **Calendar IDs** look like email addresses but end with `@group.calendar.google.com`
3. **Service Account Email** ends with `@your-project.iam.gserviceaccount.com`
4. **Base64 encoding** preserves the JSON structure in a single-line string

Need help finding any of these? Let me know which specific value you're looking for!
