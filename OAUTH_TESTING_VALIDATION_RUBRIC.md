# Google Calendar OAuth Testing & Validation Rubric

## 🎯 Overview

This document provides a comprehensive testing and validation process for the Google Calendar OAuth integration in the AKC CRM system.

## 🔧 Pre-Testing Configuration Validation

### ✅ Step 1: Environment Configuration Check

**Validation Criteria:**

- [ ] **GOOGLE_CLIENT_ID** is properly configured and trimmed
- [ ] **GOOGLE_CLIENT_SECRET** is properly configured and trimmed
- [ ] **GOOGLE_REDIRECT_URI** matches the actual Cloud Run service URL
- [ ] All Google Cloud Console OAuth settings are correct

**Commands to Execute:**

```bash
# Check Cloud Run service URL
gcloud run services describe project-crew-connect --region=us-east5 --project=crm-live-458710 --format="value(status.url)"

# Check environment variables (will show in logs)
gcloud run services logs read project-crew-connect --project=crm-live-458710 --region=us-east5 --limit=20
```

**Expected Results:**

- Service URL should be: `https://project-crew-connect-1061142868787.us-east5.run.app`
- Logs should show trimmed client ID without `%0D%0A` characters
- Client secret should show proper length after trimming

---

## 🧪 Step-by-Step Testing Process

### ✅ Test 1: Service Accessibility

**Procedure:**

1. Navigate to: `https://project-crew-connect-1061142868787.us-east5.run.app`
2. Verify the application loads successfully
3. Check for any console errors

**Pass Criteria:**

- [ ] Application loads without errors
- [ ] No 404 or 500 errors
- [ ] Frontend UI displays correctly

**Fail Actions:**

- Check Cloud Run logs for deployment issues
- Verify Cloud Build completed successfully
- Check DNS/routing configuration

---

### ✅ Test 2: OAuth Flow Initiation

**Procedure:**

1. Navigate to Settings → Calendar
2. Click "Connect Google Calendar" button
3. Monitor browser network tab and server logs

**Pass Criteria:**

- [ ] Button click triggers OAuth flow
- [ ] Redirect to Google OAuth consent screen occurs
- [ ] No JavaScript errors in browser console
- [ ] Server logs show OAuth flow start without errors

**Validation Commands:**

```bash
# Monitor logs during OAuth initiation
gcloud run services logs read project-crew-connect --project=crm-live-458710 --region=us-east5 --limit=10
```

**Expected Log Entries:**

```
[OAuth] Creating OAuth2 client...
[OAuth] After trimming:
  - clientId length: 72
  - clientSecret length: 37
[OAuth] Generated full Auth URL:
```

**Fail Actions:**

- Check if client ID shows proper length (72 characters)
- Verify no `%0D%0A` characters in generated URL
- Check client secret length is correct

---

### ✅ Test 3: Google OAuth Consent Screen

**Procedure:**

1. After redirect, verify Google consent screen displays
2. Check the consent screen shows correct application name
3. Verify required scopes are listed

**Pass Criteria:**

- [ ] Google consent screen loads
- [ ] Shows "AKC CRM" as application name
- [ ] Lists Calendar, Email, and Profile permissions
- [ ] No "Error 401: invalid_client" message

**Expected Scopes Display:**

- See and edit events on all your calendars
- See your personal info, including any personal info you've made publicly available
- See your primary Google Account email address

**Fail Actions:**

- If "Error 401: invalid_client" appears, check:
  - Client ID trimming in logs
  - Redirect URI configuration
  - OAuth client configuration in Google Cloud Console

---

### ✅ Test 4: OAuth Callback Processing

**Procedure:**

1. Click "Allow" on Google consent screen
2. Monitor redirect back to application
3. Check server logs for callback processing

**Pass Criteria:**

- [ ] Successful redirect to callback URL
- [ ] No error parameters in callback URL
- [ ] Server successfully exchanges code for tokens
- [ ] User session is created
- [ ] Redirect to success page occurs

**Validation Commands:**

```bash
# Check callback logs
gcloud run services logs read project-crew-connect --project=crm-live-458710 --region=us-east5 --limit=30 | Select-String -Pattern "callback|token|session"
```

**Expected Log Entries:**

```
[OAuth] OAUTH CALLBACK START
[OAuth] Token exchange successful!
[OAuth] User info retrieved successfully
[OAuth] Session created successfully
[OAuth] OAUTH FLOW SUCCESS
```

**Fail Actions:**

- Check for error in callback URL parameters
- Verify token exchange completed
- Check session creation succeeded

---

### ✅ Test 5: Authentication Status Verification

**Procedure:**

1. After successful OAuth, verify authentication status
2. Test API endpoints that require authentication
3. Check session persistence

**Pass Criteria:**

- [ ] `/api/auth/status` returns `authenticated: true`
- [ ] Calendar API endpoints are accessible
- [ ] Session persists across page refreshes

**API Test Commands:**

```bash
# Test authentication status (replace with actual session cookie)
curl -H "Cookie: session=YOUR_SESSION_ID" https://project-crew-connect-1061142868787.us-east5.run.app/api/auth/status
```

**Expected Response:**

```json
{
  "authenticated": true,
  "userId": "user@example.com"
}
```

---

### ✅ Test 6: Calendar API Functionality

**Procedure:**

1. Test listing user's calendars
2. Test fetching calendar events
3. Test creating a calendar event (optional)

**Pass Criteria:**

- [ ] `/api/calendar/list` returns user's calendars
- [ ] `/api/calendar/events` returns calendar events
- [ ] No authentication errors in API responses

**API Test Commands:**

```bash
# Test calendar list (replace with actual session cookie)
curl -H "Cookie: session=YOUR_SESSION_ID" https://project-crew-connect-1061142868787.us-east5.run.app/api/calendar/list
```

---

## 📊 Validation Rubric

### 🟢 PASS (All Criteria Met)

- [ ] All 6 tests pass completely
- [ ] No `invalid_client` errors
- [ ] OAuth flow completes end-to-end
- [ ] Calendar API responds correctly
- [ ] Session management works properly

### 🟡 PARTIAL (Some Issues)

- [ ] OAuth flow starts but has minor issues
- [ ] Some API endpoints work, others don't
- [ ] Session creation works but persistence issues
- [ ] Client ID trimming partially effective

### 🔴 FAIL (Critical Issues)

- [ ] `Error 401: invalid_client` still occurs
- [ ] OAuth flow doesn't start
- [ ] Callback processing fails
- [ ] No session creation
- [ ] API endpoints return authentication errors

---

## 🔍 Forensic Debugging Commands

### Real-Time Log Monitoring

```bash
# Monitor logs in real-time during testing
gcloud run services logs tail project-crew-connect --project=crm-live-458710 --region=us-east5
```

### Specific Error Pattern Search

```bash
# Search for specific error patterns
gcloud run services logs read project-crew-connect --project=crm-live-458710 --region=us-east5 --limit=100 | Select-String -Pattern "error|invalid|401|failed"
```

### OAuth Flow Analysis

```bash
# Analyze OAuth flow logs
gcloud run services logs read project-crew-connect --project=crm-live-458710 --region=us-east5 --limit=50 | Select-String -Pattern "OAuth|client_id|redirect"
```

---

## 🛠️ Troubleshooting Decision Tree

### If Test 2 Fails (OAuth Initiation)

1. **Check Client ID Length**

   - Expected: 72 characters
   - If longer: Client ID has trailing newlines
   - Action: Verify trimming code deployment

2. **Check Generated OAuth URL**
   - Look for `%0D%0A` in client_id parameter
   - If present: Trimming not working
   - Action: Redeploy with updated code

### If Test 3 Fails (Google Consent Screen)

1. **Error 401: invalid_client**

   - Root Cause: Corrupted client ID or secret
   - Action: Check trimming, verify secrets in Google Secret Manager

2. **Redirect URI Mismatch**
   - Root Cause: Wrong redirect URI configured
   - Action: Update Google Cloud Console OAuth client

### If Test 4 Fails (Callback Processing)

1. **No Authorization Code**

   - Root Cause: User denied consent or OAuth error
   - Action: Check error parameters in callback URL

2. **Token Exchange Fails**
   - Root Cause: Invalid client credentials or expired code
   - Action: Verify client secret, check timing

---

## 📈 Success Metrics

### Performance Benchmarks

- OAuth flow completion: < 10 seconds
- Calendar API response time: < 2 seconds
- Session creation time: < 1 second

### Reliability Targets

- OAuth success rate: > 95%
- API availability: > 99%
- Session persistence: 24 hours

---

## 🎉 Post-Testing Validation

### Final Checklist

- [ ] End-to-end OAuth flow works consistently
- [ ] No `invalid_client` errors in any test run
- [ ] All calendar API endpoints functional
- [ ] Session management robust
- [ ] Error handling graceful
- [ ] Logging provides adequate debugging information

### Sign-off Requirements

- [ ] Development testing complete
- [ ] Production testing complete
- [ ] All validation criteria met
- [ ] Documentation updated
- [ ] Stakeholder approval obtained

---

**Last Updated:** {{CURRENT_DATE}}
**Version:** 1.0
**Status:** Ready for Testing
