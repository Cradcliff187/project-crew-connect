/**
 * Email Resolution Service for Google Calendar Integration
 *
 * This service resolves assignee IDs to email addresses for Google Calendar invites.
 * This is the CRITICAL missing piece causing calendar event creation failures.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (use your existing connection)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Resolves a single assignee ID to email and display name
 * @param {string} assigneeType - 'employee' or 'subcontractor'
 * @param {string} assigneeId - The ID of the assignee
 * @returns {Promise<{email: string, displayName: string} | null>}
 */
async function resolveAssigneeEmail(assigneeType, assigneeId) {
  try {
    if (assigneeType === 'employee') {
      const { data, error } = await supabase
        .from('employees')
        .select('email, first_name, last_name')
        .eq('id', assigneeId)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
        return null;
      }

      if (!data.email) {
        console.warn(`Employee ${assigneeId} has no email address`);
        return null;
      }

      return {
        email: data.email,
        displayName: `${data.first_name} ${data.last_name}`,
      };
    } else if (assigneeType === 'subcontractor') {
      const { data, error } = await supabase
        .from('subcontractors')
        .select('email, company_name, contact_name')
        .eq('id', assigneeId)
        .single();

      if (error) {
        console.error('Error fetching subcontractor:', error);
        return null;
      }

      if (!data.email) {
        console.warn(`Subcontractor ${assigneeId} has no email address`);
        return null;
      }

      return {
        email: data.email,
        displayName: data.contact_name || data.company_name,
      };
    }

    return null;
  } catch (error) {
    console.error('Error in resolveAssigneeEmail:', error);
    return null;
  }
}

/**
 * Resolves multiple assignees to Google Calendar attendees format
 * @param {Array<{type: string, id: string}>} assignees - Array of assignee objects
 * @returns {Promise<Array<{email: string, displayName: string, responseStatus: string}>>}
 */
async function resolveAssigneesToAttendees(assignees) {
  if (!assignees || assignees.length === 0) {
    return [];
  }

  const attendees = [];

  for (const assignee of assignees) {
    const resolved = await resolveAssigneeEmail(assignee.type, assignee.id);

    if (resolved) {
      attendees.push({
        email: resolved.email,
        displayName: resolved.displayName,
        responseStatus: 'needsAction',
        optional: false,
      });
    } else {
      console.warn(`Could not resolve assignee: ${assignee.type} ${assignee.id}`);
    }
  }

  return attendees;
}

/**
 * Enhanced calendar event creation with email resolution
 * @param {Object} eventData - Event data from frontend
 * @returns {Promise<Object>} - Google Calendar event object
 */
async function createEnhancedCalendarEvent(eventData) {
  try {
    // Resolve assignees to attendees with emails
    const attendees = await resolveAssigneesToAttendees(eventData.assignees || []);

    // Create the Google Calendar event object
    const calendarEvent = {
      // ✅ Basic fields (already working)
      summary: eventData.title,
      description: eventData.description || '',
      location: eventData.location || '',

      // ✅ Time fields (already working)
      start: {
        dateTime: eventData.startTime,
        timeZone: eventData.timeZone || 'America/New_York',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: eventData.timeZone || 'America/New_York',
      },

      // 🆕 FIXED: Attendees with proper email addresses
      attendees: attendees,

      // 🆕 Enhanced: Event categorization with colors
      colorId: mapEventTypeToColor(eventData.entityType),

      // 🆕 Enhanced: Default reminders
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 }, // 24 hours before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },

      // ✅ Metadata (already working)
      extendedProperties: {
        private: {
          appSource: 'akc_crm',
          entityType: eventData.entityType,
          entityId: eventData.entityId,
          projectId: eventData.projectId,
        },
      },
    };

    // 🆕 Enhanced: Auto-create Google Meet for multi-attendee events
    if (attendees.length > 1) {
      calendarEvent.conferenceData = {
        createRequest: {
          requestId: `akc-${Date.now()}`, // Unique request ID
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      };
    }

    return calendarEvent;
  } catch (error) {
    console.error('Error creating enhanced calendar event:', error);
    throw error;
  }
}

/**
 * Maps event entity type to Google Calendar color
 * @param {string} entityType - The type of entity
 * @returns {string} - Google Calendar color ID
 */
function mapEventTypeToColor(entityType) {
  const colorMap = {
    project_milestone: '5', // Yellow - Milestones
    work_order: '6', // Orange - Work orders
    contact_interaction: '4', // Blue - Client meetings
    estimate: '2', // Green - Estimates
    time_entry: '1', // Lavender - Time tracking
    schedule_item: '8', // Gray - General schedule
    default: '1', // Lavender - Default
  };

  return colorMap[entityType] || colorMap['default'];
}

/**
 * Validates that all required fields are present for calendar creation
 * @param {Object} eventData - Event data to validate
 * @returns {Array<string>} - Array of validation errors (empty if valid)
 */
function validateCalendarEventData(eventData) {
  const errors = [];

  // Check required fields
  if (!eventData.title || eventData.title.trim() === '') {
    errors.push('Event title is required');
  }

  if (!eventData.startTime) {
    errors.push('Start time is required');
  }

  if (!eventData.endTime) {
    errors.push('End time is required');
  }

  // Validate time range
  if (eventData.startTime && eventData.endTime) {
    const start = new Date(eventData.startTime);
    const end = new Date(eventData.endTime);

    if (end <= start) {
      errors.push('End time must be after start time');
    }
  }

  // Check assignee structure
  if (eventData.assignees && Array.isArray(eventData.assignees)) {
    for (let i = 0; i < eventData.assignees.length; i++) {
      const assignee = eventData.assignees[i];
      if (!assignee.type || !assignee.id) {
        errors.push(`Assignee ${i + 1} is missing type or id`);
      }
      if (assignee.type !== 'employee' && assignee.type !== 'subcontractor') {
        errors.push(`Assignee ${i + 1} has invalid type: ${assignee.type}`);
      }
    }
  }

  return errors;
}

module.exports = {
  resolveAssigneeEmail,
  resolveAssigneesToAttendees,
  createEnhancedCalendarEvent,
  mapEventTypeToColor,
  validateCalendarEventData,
};

/**
 * USAGE EXAMPLE:
 *
 * // In your calendar creation endpoint
 * const { createEnhancedCalendarEvent, validateCalendarEventData } = require('./email-resolution-service');
 *
 * app.post('/api/calendar/events', async (req, res) => {
 *   try {
 *     // Validate input
 *     const errors = validateCalendarEventData(req.body);
 *     if (errors.length > 0) {
 *       return res.status(400).json({ errors });
 *     }
 *
 *     // Create enhanced event with email resolution
 *     const eventData = await createEnhancedCalendarEvent(req.body);
 *
 *     // Insert into Google Calendar
 *     const response = await calendar.events.insert({
 *       calendarId: 'primary',
 *       resource: eventData,
 *       sendUpdates: 'all',
 *       conferenceDataVersion: 1 // Required for Google Meet
 *     });
 *
 *     res.json({ success: true, event: response.data });
 *   } catch (error) {
 *     console.error('Calendar event creation failed:', error);
 *     res.status(500).json({ error: 'Failed to create calendar event' });
 *   }
 * });
 */
