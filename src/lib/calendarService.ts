import { supabase } from '@/integrations/supabase/client';

// TODO: move to a shared types file
export interface ScheduleItem {
  id?: string;
  project_id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  google_event_id?: string;
  calendar_id?: string;
  created_by?: string;
  created_at?: string;
}

async function getSharedProjectCalendarId(): Promise<string> {
  console.group('🔍 SHARED PROJECT CALENDAR RESOLUTION');

  // Get calendar IDs from environment variables - support both naming conventions
  const sharedProjectCalendarId =
    import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS || import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT;

  if (!sharedProjectCalendarId) {
    console.error('❌ No shared projects calendar ID configured');
    console.warn('⚠️ Falling back to primary calendar - THIS SHOULD BE FIXED');
    console.groupEnd();
    // TODO: Remove this fallback once environment is properly configured
    return 'primary';
  }

  console.log('✅ Using shared projects calendar:', sharedProjectCalendarId);
  console.groupEnd();
  return sharedProjectCalendarId;
}

async function createGoogleEvent(item: ScheduleItem, calendarId: string): Promise<string> {
  console.group('📅 GOOGLE EVENT CREATION');
  console.log('Calendar ID:', calendarId);
  console.log('Event Details:', {
    summary: item.title,
    description: item.description,
    start: item.start_datetime,
    end: item.end_datetime,
  });

  const requestBody = {
    calendarId,
    title: item.title,
    description: item.description,
    startTime: item.start_datetime,
    endTime: item.end_datetime,
    entityType: 'schedule_item',
    entityId: item.id || '',
    projectId: item.project_id,
  };
  console.log('📤 Request Body:', requestBody);

  console.log('📞 Calling /api/calendar/events...');
  const response = await fetch('/api/calendar/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  console.log('📡 Create Event API Response Status:', response.status);
  console.log('📡 Response OK:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Create Event API Error:', errorText);
    console.groupEnd();
    throw new Error('Failed to create Google Calendar event');
  }

  const responseData = await response.json();
  console.log('📋 Create Event API Response Data:', responseData);

  if (responseData.event?.id) {
    console.log('🎉 Google Event ID:', responseData.event.id);
    console.groupEnd();
    return responseData.event.id;
  } else {
    console.error('❌ No event ID in response:', responseData);
    console.groupEnd();
    throw new Error('No event ID returned from Google Calendar API');
  }
}

export async function createScheduleItem(item: ScheduleItem): Promise<ScheduleItem> {
  console.group('🗓️ CALENDAR SERVICE: Creating Schedule Item');
  console.log('📥 Input Data:', item);

  try {
    // Get the shared projects calendar
    console.log('🔍 Getting shared projects calendar...');
    const calendarId = await getSharedProjectCalendarId();
    console.log('📅 Using calendar ID:', calendarId);

    // Create Google Calendar event
    console.log('🌐 Creating Google Calendar event...');
    const googleEventId = await createGoogleEvent(item, calendarId);
    console.log('✅ Google event created with ID:', googleEventId);

    // Insert into Supabase
    console.log('💾 Inserting into Supabase schedule_items table...');
    const insertData = {
      ...item,
      calendar_id: calendarId,
      google_event_id: googleEventId,
    };
    console.log('📋 Insert Data:', insertData);

    const { data, error } = await supabase
      .from('schedule_items')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase Insert Error:', error);
      throw new Error(`Failed to create schedule item: ${error.message}`);
    }

    console.log('✅ Supabase Insert Success:', data);

    // Supabase Write Verification
    console.log('🔍 Verifying Supabase write...');
    const { data: inserted, error: selectError } = await supabase
      .from('schedule_items')
      .select('*')
      .eq('id', data.id)
      .single();

    if (selectError || !inserted) {
      console.error('❌ Verification Error:', selectError);
      throw new Error(
        `Failed to verify schedule item insert: ${selectError?.message || 'Not found'}`
      );
    }

    console.log('✅ Verification Success:', inserted);

    // Jest-like assertion
    if (typeof inserted.google_event_id === 'undefined' || inserted.google_event_id === null) {
      console.error('❌ Assertion failed: google_event_id is missing');
      throw new Error('Assertion failed: inserted.google_event_id is not defined');
    }

    console.log('🎉 Schedule item created successfully');
    console.groupEnd();
    return inserted;
  } catch (error) {
    console.error('💥 Calendar Service Error:', error);
    console.groupEnd();
    throw error;
  }
}

export async function updateScheduleItem(
  id: string,
  updates: Partial<ScheduleItem>
): Promise<ScheduleItem> {
  // In a real implementation, you would also update the corresponding Google Calendar event.
  // This is simplified for now.
  const { data, error } = await supabase
    .from('schedule_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update schedule item: ${error.message}`);
  }

  return data;
}

export async function deleteScheduleItem(id: string): Promise<void> {
  // In a real implementation, you would also delete the corresponding Google Calendar event.
  // This is simplified for now.
  const { error } = await supabase.from('schedule_items').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete schedule item: ${error.message}`);
  }
}

export async function listScheduleItems(projectId: string): Promise<ScheduleItem[]> {
  const { data, error } = await supabase
    .from('schedule_items')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    throw new Error(`Failed to list schedule items: ${error.message}`);
  }

  return data;
}

// Work Order Calendar Integration
export interface WorkOrderEvent {
  work_order_id: string;
  title: string;
  description?: string;
  scheduled_date: string;
  due_by_date?: string;
  assigned_to?: string;
  location?: string;
}

export async function createWorkOrderEvent(workOrder: WorkOrderEvent): Promise<string> {
  console.group('🔧 WORK ORDER CALENDAR: Creating Event');
  console.log('📥 Work Order Data:', workOrder);

  try {
    // Use the shared work orders calendar from environment
    const workOrderCalendarId = import.meta.env.VITE_GOOGLE_CALENDAR_WORK_ORDER;

    if (!workOrderCalendarId) {
      console.error('❌ No shared work orders calendar ID configured');
      console.warn('⚠️ Falling back to primary calendar - THIS SHOULD BE FIXED');
      // TODO: Remove this fallback once environment is properly configured
    }

    const targetCalendarId = workOrderCalendarId || 'primary';
    console.log('📅 Target Calendar ID:', targetCalendarId);

    // Create Google Calendar event using the real API
    console.log('🌐 Creating Google Calendar event for work order...');
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        calendarId: targetCalendarId,
        title: `WO: ${workOrder.title}`,
        description: workOrder.description || '',
        startTime: workOrder.scheduled_date,
        endTime: workOrder.due_by_date || workOrder.scheduled_date,
        entityType: 'work_order',
        entityId: workOrder.work_order_id,
        location: workOrder.location,
      }),
    });

    console.log('📡 Create Event API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Create Event API Error:', errorText);
      throw new Error('Failed to create Google Calendar event for work order');
    }

    const responseData = await response.json();
    console.log('📋 Create Event API Response Data:', responseData);

    if (responseData.event?.id) {
      const googleEventId = responseData.event.id;
      console.log('✅ Work order event created with ID:', googleEventId);
      console.groupEnd();
      return googleEventId;
    } else {
      console.error('❌ No event ID in response:', responseData);
      console.groupEnd();
      throw new Error('No event ID returned from Google Calendar API');
    }
  } catch (error) {
    console.error('💥 Work Order Calendar Error:', error);
    console.groupEnd();
    throw error;
  }
}
