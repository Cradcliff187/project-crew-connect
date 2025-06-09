// Additional API endpoints for server-production.cjs
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

// Initialize Supabase admin client for secure operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function setupAdditionalEndpoints(app) {
  console.log('Setting up additional API endpoints...');

  // Middleware to ensure authentication
  const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // ------ SCHEDULE ITEMS CRUD ENDPOINTS -------

  // CREATE new schedule item in database
  app.post('/api/schedule-items', requireAuth, async (req, res) => {
    try {
      console.log('[Schedule Items API] Creating new schedule item');

      if (!supabaseAdmin) {
        throw new Error('Supabase client not initialized');
      }

      const {
        project_id,
        title,
        description,
        start_datetime,
        end_datetime,
        assignee_type,
        assignee_id,
        send_invite,
        calendar_integration_enabled,
        is_all_day,
      } = req.body;

      // Validation
      if (!project_id || !title || !start_datetime || !end_datetime) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: project_id, title, start_datetime, end_datetime',
        });
      }

      // Create schedule item in database
      const { data: scheduleItem, error: insertError } = await supabaseAdmin
        .from('schedule_items')
        .insert({
          project_id,
          title: title.trim(),
          description: description || null,
          start_datetime,
          end_datetime,
          assignee_type: assignee_type || null,
          assignee_id: assignee_id || null,
          send_invite: send_invite || false,
          calendar_integration_enabled: calendar_integration_enabled !== false, // Default to true
          is_all_day: is_all_day || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Schedule Items API] Database error:', insertError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create schedule item',
          details: insertError.message,
        });
      }

      console.log(`[Schedule Items API] Created schedule item: ${scheduleItem.id}`);

      res.json({
        success: true,
        data: scheduleItem,
        message: 'Schedule item created successfully',
      });
    } catch (error) {
      console.error('[Schedule Items API] Error creating schedule item:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create schedule item',
      });
    }
  });

  // GET schedule items for a project
  app.get('/api/schedule-items', requireAuth, async (req, res) => {
    try {
      const { project_id } = req.query;

      if (!supabaseAdmin) {
        throw new Error('Supabase client not initialized');
      }

      let query = supabaseAdmin
        .from('schedule_items')
        .select('*')
        .order('start_datetime', { ascending: true });

      if (project_id) {
        query = query.eq('project_id', project_id);
      }

      const { data: scheduleItems, error } = await query;

      if (error) {
        console.error('Error fetching schedule items:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch schedule items',
        });
      }

      res.json({
        success: true,
        data: scheduleItems || [],
      });
    } catch (error) {
      console.error('Error in schedule items API:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch schedule items',
      });
    }
  });

  // UPDATE schedule item
  app.put('/api/schedule-items/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!supabaseAdmin) {
        throw new Error('Supabase client not initialized');
      }

      // Remove id from updates to prevent changing it
      delete updates.id;

      // Add updated timestamp
      updates.updated_at = new Date().toISOString();

      const { data: scheduleItem, error: updateError } = await supabaseAdmin
        .from('schedule_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('[Schedule Items API] Update error:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update schedule item',
          details: updateError.message,
        });
      }

      res.json({
        success: true,
        data: scheduleItem,
        message: 'Schedule item updated successfully',
      });
    } catch (error) {
      console.error('[Schedule Items API] Error updating schedule item:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update schedule item',
      });
    }
  });

  // DELETE schedule item
  app.delete('/api/schedule-items/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      if (!supabaseAdmin) {
        throw new Error('Supabase client not initialized');
      }

      const { error: deleteError } = await supabaseAdmin
        .from('schedule_items')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('[Schedule Items API] Delete error:', deleteError);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete schedule item',
          details: deleteError.message,
        });
      }

      res.json({
        success: true,
        message: 'Schedule item deleted successfully',
      });
    } catch (error) {
      console.error('[Schedule Items API] Error deleting schedule item:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete schedule item',
      });
    }
  });

  // SYNC schedule item with calendar
  app.post('/api/schedule-items/:itemId/sync-calendar', requireAuth, async (req, res) => {
    const { itemId } = req.params;
    console.log(`[Calendar Sync] Received request for schedule item ID: ${itemId}`);

    try {
      // Verify Supabase client is initialized
      if (!supabaseAdmin) {
        throw new Error('Supabase client not initialized - check environment variables');
      }

      // 1. Fetch the schedule item from Supabase
      let item;
      try {
        const { data, error: itemError } = await supabaseAdmin
          .from('schedule_items')
          .select('*')
          .eq('id', itemId)
          .single();

        if (itemError) {
          console.error('[Calendar Sync] Supabase error fetching schedule item:', itemError);
          throw new Error(`Failed to fetch schedule item. DB Error: ${itemError.message}`);
        }
        if (!data) {
          console.error(`[Calendar Sync] Schedule item with ID ${itemId} not found.`);
          throw new Error('Schedule item not found.');
        }
        item = data;
      } catch (fetchError) {
        console.error('[Calendar Sync] Exception during Supabase fetch:', fetchError);
        throw new Error(`Database connection error: ${fetchError.message}`);
      }

      console.log(`[Calendar Sync] Found item: ${item.title}`);

      // For now, return success
      // TODO: Implement actual Google Calendar sync
      res.json({
        success: true,
        message: 'Calendar sync endpoint ready for implementation',
        itemId,
        item,
      });
    } catch (error) {
      console.error('[Calendar Sync] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to sync with calendar',
      });
    }
  });

  // OCR Receipt Processing
  app.post('/api/ocr/process-receipt', async (req, res) => {
    try {
      // For now, return a mock response
      // In production, this would integrate with an OCR service
      res.json({
        success: true,
        message: 'OCR processing not yet implemented',
        data: {
          vendor: 'Sample Vendor',
          amount: 0,
          date: new Date().toISOString(),
          items: [],
        },
      });
    } catch (error) {
      console.error('OCR processing error:', error);
      res.status(500).json({ error: 'Failed to process receipt' });
    }
  });

  // Project Management Endpoints
  app.get('/api/projects', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.get('/api/work-orders', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Failed to fetch work orders:', error);
      res.status(500).json({ error: 'Failed to fetch work orders' });
    }
  });

  // Calendar Entity Event Endpoints
  app.post('/api/calendar/milestones/:milestoneId', async (req, res) => {
    try {
      const { milestoneId } = req.params;
      const eventData = req.body;

      // TODO: Implement actual calendar event creation
      res.json({
        success: true,
        message: 'Milestone calendar event endpoint ready',
        milestoneId,
        eventData,
      });
    } catch (error) {
      console.error('Failed to create milestone event:', error);
      res.status(500).json({ error: 'Failed to create milestone event' });
    }
  });

  // Google Calendar Create Event endpoint
  app.post('/api/google/create-event', requireAuth, async (req, res) => {
    try {
      const { calendarId, summary, description, start, end, attendees } = req.body;

      // For now, return a mock response
      // TODO: Implement actual Google Calendar integration
      const mockEventId = `mock-event-${Date.now()}`;

      console.log('[Google Calendar API] Creating event:', {
        calendarId,
        summary,
        eventId: mockEventId,
      });

      res.json({
        success: true,
        eventId: mockEventId,
        message: 'Mock Google Calendar event created',
      });
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      res.status(500).json({ error: 'Failed to create calendar event' });
    }
  });

  // Google Calendar Create Calendar endpoint
  app.post('/api/google/create-calendar', requireAuth, async (req, res) => {
    try {
      const { summary, description } = req.body;

      // For now, return a mock response
      // TODO: Implement actual Google Calendar creation
      const mockCalendarId = `mock-calendar-${Date.now()}`;

      console.log('[Google Calendar API] Creating calendar:', {
        summary,
        calendarId: mockCalendarId,
      });

      res.json({
        success: true,
        calendarId: mockCalendarId,
        message: 'Mock Google Calendar created',
      });
    } catch (error) {
      console.error('Failed to create Google Calendar:', error);
      res.status(500).json({ error: 'Failed to create calendar' });
    }
  });

  app.post('/api/calendar/workorders/:workOrderId', async (req, res) => {
    try {
      const { workOrderId } = req.params;
      const eventData = req.body;

      // TODO: Implement actual calendar event creation
      res.json({
        success: true,
        message: 'Work order calendar event endpoint ready',
        workOrderId,
        eventData,
      });
    } catch (error) {
      console.error('Failed to create work order event:', error);
      res.status(500).json({ error: 'Failed to create work order event' });
    }
  });

  app.post('/api/calendar/contacts/meetings/:interactionId', async (req, res) => {
    try {
      const { interactionId } = req.params;
      const eventData = req.body;

      // TODO: Implement actual calendar event creation
      res.json({
        success: true,
        message: 'Contact meeting calendar event endpoint ready',
        interactionId,
        eventData,
      });
    } catch (error) {
      console.error('Failed to create meeting event:', error);
      res.status(500).json({ error: 'Failed to create meeting event' });
    }
  });

  app.post('/api/calendar/timeentries/:timeEntryId', async (req, res) => {
    try {
      const { timeEntryId } = req.params;
      const eventData = req.body;

      // TODO: Implement actual calendar event creation
      res.json({
        success: true,
        message: 'Time entry calendar event endpoint ready',
        timeEntryId,
        eventData,
      });
    } catch (error) {
      console.error('Failed to create time entry event:', error);
      res.status(500).json({ error: 'Failed to create time entry event' });
    }
  });

  // Calendar Configuration
  app.get('/api/calendar/config', async (req, res) => {
    try {
      // Return calendar configuration
      res.json({
        defaultCalendarId: 'primary',
        timezone: 'America/New_York',
        workingHours: {
          start: '09:00',
          end: '17:00',
        },
        allowedCalendarTypes: ['project', 'work_order', 'personal'],
      });
    } catch (error) {
      console.error('Failed to get calendar config:', error);
      res.status(500).json({ error: 'Failed to get calendar configuration' });
    }
  });

  app.post('/api/calendar/invites', async (req, res) => {
    try {
      const inviteData = req.body;

      // TODO: Implement actual invite sending
      res.json({
        success: true,
        message: 'Calendar invite endpoint ready',
        inviteData,
      });
    } catch (error) {
      console.error('Failed to send calendar invite:', error);
      res.status(500).json({ error: 'Failed to send calendar invite' });
    }
  });

  // Assignee Email Lookup
  app.get('/api/assignees/:type/:id/email', async (req, res) => {
    try {
      const { type, id } = req.params;

      let email = null;
      if (type === 'employee') {
        const { data, error } = await supabase
          .from('employees')
          .select('email')
          .eq('id', id)
          .single();

        if (!error && data) email = data.email;
      } else if (type === 'subcontractor') {
        const { data, error } = await supabase
          .from('subcontractors')
          .select('email')
          .eq('id', id)
          .single();

        if (!error && data) email = data.email;
      }

      if (email) {
        res.json({ email });
      } else {
        res.status(404).json({ error: 'Assignee not found' });
      }
    } catch (error) {
      console.error('Failed to get assignee email:', error);
      res.status(500).json({ error: 'Failed to get assignee email' });
    }
  });

  console.log('Additional API endpoints configured');
}

module.exports = { setupAdditionalEndpoints };
