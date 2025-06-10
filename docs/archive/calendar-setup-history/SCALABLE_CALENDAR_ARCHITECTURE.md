# Scalable Calendar Architecture for AKC CRM

## Architecture Overview

Your calendar integration is designed for scalability using a single, unified service account approach.

### Why This Architecture Scales

#### 1. Single Service Account Pattern

```
project-crew-connect@crm-live-458710.iam.gserviceaccount.com
    ├── Cloud Run Service
    ├── Calendar Operations
    ├── Future Google Services
    └── Webhook Authentication
```

**Benefits:**

- **Centralized Identity**: One service account for all Google API operations
- **Simplified IAM**: Single point of permission management
- **Easy Key Rotation**: Update one key, everything continues working
- **Audit Trail**: All operations traced to one identity

#### 2. Shared Calendar Model

```
Projects Calendar ──┐
                    ├── Service Account Access
Work Orders Calendar┤
                    └── No User Authentication Required
```

**Benefits:**

- **No User Dependency**: Calendar sync works without user login
- **Company-Wide Visibility**: Shared calendars for all projects/work orders
- **Offline Sync**: Service account can sync even when users are offline
- **Webhook Ready**: Service account can receive calendar change notifications

#### 3. Environment Variable Flexibility

```javascript
// Supports both naming conventions
const calendarId =
  import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS || import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT;
```

**Benefits:**

- **Backward Compatibility**: Works with existing deployments
- **Migration Path**: Can transition variable names without breaking
- **Multi-Environment**: Different configs for dev/staging/prod

### Scaling Scenarios

#### Adding More Calendar Types

When you need calendars for Estimates, Invoices, etc.:

```javascript
// Easy to extend
case 'estimate':
  targetCalendarId = import.meta.env.VITE_GOOGLE_CALENDAR_ESTIMATES;
  break;
case 'invoice':
  targetCalendarId = import.meta.env.VITE_GOOGLE_CALENDAR_INVOICES;
  break;
```

#### Adding Google Drive Integration

Same service account works:

```javascript
const drive = google.drive({
  version: 'v3',
  auth: serviceAccountAuth.getClient(), // Same auth!
});
```

#### Multi-Tenant Support

If you expand to multiple companies:

```javascript
const calendarId = getCalendarForTenant(tenantId);
// Service account has access to all tenant calendars
```

### Security Best Practices

1. **Key Rotation Schedule**

   - Rotate service account keys every 90 days
   - Use Google Secret Manager versioning
   - Zero-downtime key updates

2. **Least Privilege**

   - Service account only has calendar permissions
   - Add permissions as features require them
   - Regular permission audits

3. **Webhook Security**
   - Random token validation
   - HTTPS only
   - Request signature verification

### Performance Optimization

1. **Connection Pooling**

   ```javascript
   // Service account client is reused
   const client = await serviceAccountAuth.getClient();
   ```

2. **Batch Operations**

   ```javascript
   // Future: Batch multiple calendar operations
   const batch = google.calendar.batch();
   ```

3. **Caching Strategy**
   - Cache calendar IDs in memory
   - Cache service account tokens
   - Reduce API calls

### Monitoring & Observability

1. **Structured Logging**

   ```javascript
   console.log('[Calendar] Operation:', {
     action: 'create_event',
     calendarType: 'project',
     serviceAccount: 'project-crew-connect',
     timestamp: new Date(),
   });
   ```

2. **Metrics to Track**
   - Calendar API quota usage
   - Sync latency
   - Error rates by calendar type
   - Webhook delivery success

### Future Enhancements

1. **Calendar Templates**

   - Project template calendars
   - Automated event creation rules
   - Recurring event patterns

2. **Advanced Sync**

   - Conflict resolution
   - Offline queue for changes
   - Bulk import/export

3. **Integration Expansion**
   - Google Meet auto-creation
   - Google Tasks integration
   - Calendar analytics

### Migration Path

Your current setup provides a clear migration path:

1. **Phase 1** (Current): Basic calendar sync
2. **Phase 2**: Add webhook-based two-way sync
3. **Phase 3**: Add calendar templates
4. **Phase 4**: Multi-tenant support

### Cost Optimization

Using one service account reduces costs:

- Single identity to manage
- Fewer API calls (batching possible)
- Shared rate limits across features
- No per-user calendar API costs

### Disaster Recovery

Service account approach enables:

- Easy backup of all calendar data
- Quick restore capabilities
- Cross-region failover
- Automated health checks

## Conclusion

This architecture positions your application for growth while maintaining simplicity. The single service account pattern is Google's recommended approach for server-to-server communication and provides the best foundation for scaling your calendar integration.
