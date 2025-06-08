// Additional API endpoints for server-production.cjs
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

function setupAdditionalEndpoints(app) {
  console.log('Setting up additional API endpoints...');

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
