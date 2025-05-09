-- Calendar Assignment Cost Roll-up View
-- This view calculates costs for calendar assignments based on rates and durations

-- First, create a function to calculate hours between dates
CREATE OR REPLACE FUNCTION calculate_work_hours(
  p_start_time TIMESTAMP,
  p_end_time TIMESTAMP,
  p_is_all_day BOOLEAN
)
RETURNS NUMERIC AS $$
DECLARE
  hours NUMERIC;
BEGIN
  IF p_is_all_day THEN
    -- For all-day events, calculate days and multiply by standard work day (8 hours)
    hours := (EXTRACT(EPOCH FROM p_end_time - p_start_time) / 3600 / 24) * 8;
  ELSE
    -- For time-specific events, calculate actual hours
    hours := EXTRACT(EPOCH FROM p_end_time - p_start_time) / 3600;
  END IF;

  -- Ensure we don't have negative hours and round to 2 decimal places
  RETURN ROUND(GREATEST(hours, 0), 2);
END;
$$ LANGUAGE plpgsql;

-- Create the view for cost roll-up
CREATE OR REPLACE VIEW calendar_assignment_costs AS
WITH daily_assignments AS (
  -- Get each day's assignment by expanding multi-day assignments
  SELECT
    a.id AS assignment_id,
    a.entity_type,
    a.entity_id,
    e.title AS event_title,
    a.assignee_id,
    a.assignee_type,
    c.email AS assignee_email,
    c.name AS assignee_name,
    -- Generate a series of dates for multi-day assignments
    CASE
      WHEN a.end_date IS NULL THEN a.start_date
      ELSE date_day
    END AS event_date,
    -- Use a standard rate if none specified
    COALESCE(a.rate_per_hour, 0) AS rate_per_hour,
    e.is_all_day,
    e.start_datetime,
    e.end_datetime
  FROM
    assignments a
  JOIN
    unified_calendar_events e ON a.entity_type = e.entity_type AND a.entity_id = e.entity_id
  LEFT JOIN
    contacts c ON a.assignee_id = c.id AND a.assignee_type = 'contact'
  LEFT JOIN
    employees emp ON a.assignee_id = emp.id AND a.assignee_type = 'employee'
  LEFT JOIN
    subcontractors sub ON a.assignee_id = sub.id AND a.assignee_type = 'subcontractor',
  -- Generate a series of dates between start and end (inclusive)
  LATERAL (
    SELECT generate_series(
      a.start_date,
      COALESCE(a.end_date, a.start_date),
      interval '1 day'
    )::date AS date_day
  ) dates
  WHERE
    a.start_date IS NOT NULL
)

SELECT
  assignment_id,
  entity_type,
  entity_id,
  event_title,
  assignee_id,
  assignee_type,
  assignee_email,
  assignee_name,
  event_date,
  rate_per_hour,
  -- Calculate hours for this assignment day
  CASE
    -- For single day assignments, use the event's actual duration
    WHEN event_date = start_datetime::date AND event_date = COALESCE(end_datetime::date, start_datetime::date) THEN
      calculate_work_hours(start_datetime, COALESCE(end_datetime, start_datetime + interval '1 hour'), is_all_day)
    -- For all-day events, use standard workday hours
    WHEN is_all_day THEN 8.0
    -- For partial days at the start of multi-day events
    WHEN event_date = start_datetime::date THEN
      calculate_work_hours(start_datetime, (start_datetime::date + interval '1 day')::timestamp, false)
    -- For partial days at the end of multi-day events
    WHEN event_date = end_datetime::date THEN
      calculate_work_hours(end_datetime::date, end_datetime, false)
    -- For full days in the middle of multi-day events
    ELSE 8.0
  END AS hours,
  -- Calculate cost (rate × hours)
  CASE
    WHEN rate_per_hour > 0 THEN
      ROUND(
        rate_per_hour *
        CASE
          WHEN event_date = start_datetime::date AND event_date = COALESCE(end_datetime::date, start_datetime::date) THEN
            calculate_work_hours(start_datetime, COALESCE(end_datetime, start_datetime + interval '1 hour'), is_all_day)
          WHEN is_all_day THEN 8.0
          WHEN event_date = start_datetime::date THEN
            calculate_work_hours(start_datetime, (start_datetime::date + interval '1 day')::timestamp, false)
          WHEN event_date = end_datetime::date THEN
            calculate_work_hours(end_datetime::date, end_datetime, false)
          ELSE 8.0
        END,
        2
      )
    ELSE 0
  END AS cost
FROM
  daily_assignments
ORDER BY
  event_date, entity_type, entity_id, assignee_id;

-- Create an example query function for reporting
CREATE OR REPLACE FUNCTION get_calendar_costs_by_project(
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  project_id TEXT,
  project_name TEXT,
  total_cost NUMERIC,
  total_hours NUMERIC,
  assignee_details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    costs.entity_id AS project_id,
    p.name AS project_name,
    SUM(costs.cost) AS total_cost,
    SUM(costs.hours) AS total_hours,
    jsonb_agg(
      jsonb_build_object(
        'assignee_id', costs.assignee_id,
        'assignee_name', costs.assignee_name,
        'assignee_type', costs.assignee_type,
        'hours', SUM(costs.hours),
        'cost', SUM(costs.cost)
      )
    ) AS assignee_details
  FROM
    calendar_assignment_costs costs
  LEFT JOIN
    projects p ON costs.entity_id = p.id
  WHERE
    costs.entity_type = 'project'
    AND costs.event_date BETWEEN p_start_date AND p_end_date
  GROUP BY
    costs.entity_id, p.name
  ORDER BY
    total_cost DESC;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_calendar_costs_by_project('2023-09-01', '2023-09-30');

-- Comment: This view and function allow for detailed cost tracking of calendar assignments
-- You can run queries like:
--
-- 1. Get costs for a specific project:
-- SELECT * FROM calendar_assignment_costs
-- WHERE entity_type = 'project' AND entity_id = 'your_project_id';
--
-- 2. Get costs for a specific date range:
-- SELECT entity_id, entity_type, SUM(hours) as total_hours, SUM(cost) as total_cost
-- FROM calendar_assignment_costs
-- WHERE event_date BETWEEN '2023-09-01' AND '2023-09-30'
-- GROUP BY entity_id, entity_type
-- ORDER BY total_cost DESC;
--
-- 3. Get costs by assignee type:
-- SELECT assignee_type, SUM(cost) as total_cost
-- FROM calendar_assignment_costs
-- WHERE event_date BETWEEN '2023-09-01' AND '2023-09-30'
-- GROUP BY assignee_type;
