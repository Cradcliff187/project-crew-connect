import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

// Mock data
const TEST_PROJECT = {
  id: 'test-project-1',
  name: 'Calendar Test Project',
};

const TEST_WORK_ORDER = {
  id: 'test-wo-1',
  name: 'Calendar Test Work Order',
};

const TEST_EMPLOYEE = {
  id: 'test-emp-1',
  name: 'John Tester',
  email: 'john.tester@example.com',
  rate: 75,
};

test.describe('Calendar Integration E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login and setup
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create an event and verify on shared calendar', async ({ page }) => {
    // Mock the calendar API response
    await page.route('**/api/calendar/**', async route => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/api/calendar/create') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            event: {
              id: 'test-event-1',
              google_event_id: 'google-event-1',
              title: 'Test Calendar Event',
              start_datetime: new Date().toISOString(),
              end_datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            },
          }),
        });
      } else if (url.includes('/api/calendar/list')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            calendars: [
              { id: 'primary', summary: 'Personal Calendar' },
              { id: 'team-calendar', summary: 'Team Calendar' },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to project details
    await page.goto(`/projects/${TEST_PROJECT.id}`);
    await page.waitForSelector('h1:has-text("Project Details")');

    // Open the schedule dialog
    await page.click('button:has-text("Schedule")');
    await page.waitForSelector('div[role="dialog"]:has-text("Schedule Event")');

    // Fill in the form
    await page.fill('input[name="title"]', 'Test Calendar Event');

    // Select tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click('button:has-text("Pick a date")');
    await page.click(`button[aria-label="${format(tomorrow, 'MMMM d, yyyy')}"]`);

    // Set the start time
    await page.fill('input[aria-label="Hour"]', '10');
    await page.fill('input[aria-label="Minute"]', '00');

    // Set end time
    await page.click('button:has-text("End")');
    await page.fill('input[aria-label="Hour"]', '12');
    await page.fill('input[aria-label="Minute"]', '00');

    // Set assignee
    await page.click('button:has-text("Select assignee")');
    await page.click(`div:has-text("${TEST_EMPLOYEE.name}")`);

    // Enable Google Calendar integration
    await page.check('input[name="googleCalendarEnabled"]');

    // Save the event
    await page.click('button:has-text("Save")');

    // Verify the toast notification
    await expect(page.locator('.toast:has-text("Event created")')).toBeVisible();

    // Verify the event appears in the project schedule
    await expect(page.locator(`.schedule-item:has-text("Test Calendar Event")`)).toBeVisible();

    // Verify the cost information is displayed correctly
    const costElement = page.locator('.schedule-item:has-text("Test Calendar Event") .cost-value');
    await expect(costElement).toBeVisible();
    const costText = await costElement.textContent();
    expect(costText).toContain('$150.00'); // 2 hours at $75/hour
  });

  test('should edit an event in the app and verify calendar update', async ({ page }) => {
    // Mock the calendar API responses
    await page.route('**/api/calendar/**', async route => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/api/calendar/update') && method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            event: {
              id: 'test-event-1',
              google_event_id: 'google-event-1',
              title: 'Updated Calendar Event',
              start_datetime: new Date().toISOString(),
              end_datetime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to the work order with the calendar event
    await page.goto(`/work-orders/${TEST_WORK_ORDER.id}`);
    await page.waitForSelector('h1:has-text("Work Order Details")');

    // Find and click on the event to edit
    await page.click('.schedule-item:has-text("Test Calendar Event")');
    await page.waitForSelector('div[role="dialog"]:has-text("Edit Schedule")');

    // Update the title
    await page.fill('input[name="title"]', 'Updated Calendar Event');

    // Update the duration (to 3 hours)
    await page.click('button:has-text("End")');
    await page.fill('input[aria-label="Hour"]', '13');
    await page.fill('input[aria-label="Minute"]', '00');

    // Save the changes
    await page.click('button:has-text("Save Changes")');

    // Verify the toast notification
    await expect(page.locator('.toast:has-text("Event updated")')).toBeVisible();

    // Verify the updated event title appears
    await expect(page.locator(`.schedule-item:has-text("Updated Calendar Event")`)).toBeVisible();

    // Verify the updated cost (3 hours at $75/hour = $225)
    const costElement = page.locator(
      '.schedule-item:has-text("Updated Calendar Event") .cost-value'
    );
    await expect(costElement).toBeVisible();
    const costText = await costElement.textContent();
    expect(costText).toContain('$225.00');
  });

  test('should handle calendar sync and update UI after external changes', async ({ page }) => {
    // Mock the calendar API for sync
    await page.route('**/api/calendar/sync', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          changes: {
            updated: 1,
            created: 0,
            deleted: 0,
          },
          events: [
            {
              id: 'test-event-1',
              google_event_id: 'google-event-1',
              title: 'Externally Modified Event',
              start_datetime: new Date().toISOString(),
              end_datetime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
              assignee_id: TEST_EMPLOYEE.id,
              rate_per_hour: TEST_EMPLOYEE.rate,
            },
          ],
        }),
      });
    });

    // Navigate to settings
    await page.goto('/settings');
    await page.click('button[role="tab"]:has-text("Google Calendar")');

    // Trigger a sync
    await page.click('button:has-text("Refresh Connection")');

    // Verify the toast notification
    await expect(page.locator('.toast:has-text("Calendars synchronized")')).toBeVisible();

    // Navigate back to the work order to see if it's updated
    await page.goto(`/work-orders/${TEST_WORK_ORDER.id}`);

    // Verify the updated event title from external changes
    await expect(
      page.locator(`.schedule-item:has-text("Externally Modified Event")`)
    ).toBeVisible();

    // Verify the updated cost (4 hours at $75/hour = $300)
    const costElement = page.locator(
      '.schedule-item:has-text("Externally Modified Event") .cost-value'
    );
    await expect(costElement).toBeVisible();
    const costText = await costElement.textContent();
    expect(costText).toContain('$300.00');
  });

  test('should verify cost column shows correct roll-up value in project list', async ({
    page,
  }) => {
    // Navigate to projects list
    await page.goto('/projects');

    // Find the test project row
    const projectRow = page.locator(`tr:has-text("${TEST_PROJECT.name}")`);
    await expect(projectRow).toBeVisible();

    // Check that the cost cell contains the assignment cost
    const costCell = projectRow.locator('td:nth-child(5)');
    const costText = await costCell.textContent();

    // Extract the assignment cost (the green text with dollar sign)
    const assignmentCostText = await costCell.locator('.text-emerald-600').textContent();

    // Verify it contains a dollar amount
    expect(assignmentCostText).toMatch(/\$\d+\.\d{2}/);

    // Navigate to work orders list
    await page.goto('/work-orders');

    // Find the test work order row
    const workOrderRow = page.locator(`tr:has-text("${TEST_WORK_ORDER.name}")`);
    await expect(workOrderRow).toBeVisible();

    // Check that the cost cell contains the correct assignment cost
    const woCostCell = workOrderRow.locator('td:has-text("$")');
    const woCostText = await woCostCell.textContent();

    // Verify the cost contains the expected amount
    expect(woCostText).toContain('$300.00');
  });
});
