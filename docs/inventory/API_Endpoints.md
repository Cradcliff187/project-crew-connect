# API Endpoints Inventory

This document catalogs all the API endpoints in the application, including Express server endpoints and Supabase functions.

## Table of Contents

- [Authentication API](#authentication-api)
- [Google Integration API](#google-integration-api)
- [Maps API](#maps-api)
- [Supabase Functions](#supabase-functions)

## Authentication API

| Endpoint                | Method | Handler   | Auth Required | Supabase Tables | Purpose                           |
| ----------------------- | ------ | --------- | ------------- | --------------- | --------------------------------- |
| `/auth/google`          | GET    | server.js | No            | -               | Initiates Google OAuth flow       |
| `/auth/google/callback` | GET    | server.js | No            | -               | Handles OAuth callback            |
| `/api/auth/status`      | GET    | server.js | Session       | -               | Checks authentication status      |
| `/api/auth/logout`      | POST   | server.js | Yes           | -               | Logs out user by clearing session |
| `/auth/logout`          | GET    | server.js | Yes           | -               | Alternative logout endpoint       |

## Google Integration API

### Testing Endpoints

| Endpoint         | Method | Handler   | Auth Required | Supabase Tables | Purpose                          |
| ---------------- | ------ | --------- | ------------- | --------------- | -------------------------------- |
| `/test/drive`    | GET    | server.js | Yes           | -               | Tests Google Drive API access    |
| `/test/calendar` | GET    | server.js | Yes           | -               | Tests Google Calendar API access |
| `/test/gmail`    | GET    | server.js | Yes           | -               | Tests Gmail API access           |
| `/test/sheets`   | GET    | server.js | Yes           | -               | Tests Google Sheets API access   |
| `/test/docs`     | GET    | server.js | Yes           | -               | Tests Google Docs API access     |

### Maps API

| Endpoint                 | Method | Handler   | Auth Required | Supabase Tables | Purpose                        |
| ------------------------ | ------ | --------- | ------------- | --------------- | ------------------------------ |
| `/api/maps/autocomplete` | GET    | server.js | No            | -               | Google Maps place autocomplete |

### Calendar API

| Endpoint                        | Method | Handler     | Auth Required | Supabase Tables | Purpose               |
| ------------------------------- | ------ | ----------- | ------------- | --------------- | --------------------- |
| `/api/calendar/events`          | GET    | calendar.js | Yes           | -               | List calendar events  |
| `/api/calendar/events`          | POST   | calendar.js | Yes           | -               | Create calendar event |
| `/api/calendar/events/:eventId` | GET    | calendar.js | Yes           | -               | Get event details     |
| `/api/calendar/events/:eventId` | PUT    | calendar.js | Yes           | -               | Update event          |
| `/api/calendar/events/:eventId` | DELETE | calendar.js | Yes           | -               | Delete event          |

### Drive API

| Endpoint                   | Method | Handler  | Auth Required | Supabase Tables | Purpose              |
| -------------------------- | ------ | -------- | ------------- | --------------- | -------------------- |
| `/api/drive/files`         | GET    | drive.js | Yes           | -               | List Drive files     |
| `/api/drive/upload`        | POST   | drive.js | Yes           | -               | Upload file to Drive |
| `/api/drive/files/:fileId` | GET    | drive.js | Yes           | -               | Get file details     |
| `/api/drive/files/:fileId` | DELETE | drive.js | Yes           | -               | Delete file          |

### Gmail API

| Endpoint              | Method | Handler  | Auth Required | Supabase Tables | Purpose             |
| --------------------- | ------ | -------- | ------------- | --------------- | ------------------- |
| `/api/gmail/messages` | GET    | gmail.js | Yes           | -               | List email messages |
| `/api/gmail/send`     | POST   | gmail.js | Yes           | -               | Send email          |

## Supabase Functions

### Expense Update Function

| Function         | Handler           | Auth Required      | Supabase Tables      | Purpose                                            |
| ---------------- | ----------------- | ------------------ | -------------------- | -------------------------------------------------- |
| `expense_update` | expense_update.ts | Yes (Service Role) | expenses, workorders | Updates expense records and related workorder data |

### Estimate PDF Generation

| Function                | Handler                        | Auth Required      | Supabase Tables                  | Purpose                          |
| ----------------------- | ------------------------------ | ------------------ | -------------------------------- | -------------------------------- |
| `generate-estimate-pdf` | generate-estimate-pdf/index.ts | Yes (Service Role) | estimates, customers, line_items | Generates PDF from estimate data |

## Database Access Patterns

### Direct Supabase Client Access

Most front-end components use the Supabase client directly to interact with the database. Common patterns include:

1. **Authentication**

   - `supabase.auth.signInWithOAuth()`
   - `supabase.auth.signOut()`
   - `supabase.auth.getSession()`

2. **Data Fetching**

   - `supabase.from('table_name').select('*')`
   - `supabase.from('table_name').select('column1, column2').eq('id', id)`
   - `supabase.from('table_name').select('*, related_table(*)').eq('id', id)`

3. **Data Manipulation**

   - `supabase.from('table_name').insert([data])`
   - `supabase.from('table_name').update(data).eq('id', id)`
   - `supabase.from('table_name').delete().eq('id', id)`

4. **Real-time Subscriptions**
   - `supabase.from('table_name').on('INSERT', callback).subscribe()`

## Security & Auth Guards

1. **Express Server**

   - Custom `requireAuth` middleware validates session token
   - Uses `oauth2Client` for token refresh

2. **Supabase RLS Policies**

   - Row Level Security policies restrict data access
   - Service Role key used for admin operations
   - Anonymous key used for client-side operations with RLS

3. **Function Authorization**
   - Supabase edge functions require JWT validation
   - Service role functions bypass RLS for privileged operations
