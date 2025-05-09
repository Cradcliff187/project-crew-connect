# Calendar Event Schema Design

## Overview

This document outlines the database schema design for calendar event integration in the application.
The design centralizes all calendar event data in a unified table while maintaining references to
individual entity tables.

## ER Diagram

```
┌─────────────────────────────┐
│ unified_calendar_events     │
├─────────────────────────────┤
│ id (PK)                     │
│ title                       │
│ description                 │
│ start_datetime              │
│ end_datetime                │
│ is_all_day                  │
│ location                    │
│ google_event_id             │
│ calendar_id                 │
│ sync_enabled                │
│ last_synced_at              │
│ assignee_type               │
│ assignee_id                 │
│ entity_type                 │
│ entity_id                   │
│ project_id                  │
│ created_at                  │
│ updated_at                  │
│ created_by                  │
└─────────────┬───────────────┘
              │
              │ entity_type & entity_id (polymorphic)
              │
              ▼
┌─────────────┴────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ project_milestones       │     │ schedule_items       │     │ work_orders         │
├──────────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│ id (PK)                  │     │ id (PK)             │     │ id (PK)             │
│ title                    │     │ title               │     │ title               │
│ description              │     │ description         │     │ description         │
│ start_date               │     │ start_datetime      │     │ start_datetime      │
│ due_date                 │     │ end_datetime        │     │ end_datetime        │
│ projectid                │     │ projectid           │     │ projectid           │
│ calendar_sync_enabled    │     │ calendar_sync_enabled│     │ calendar_sync_enabled│
│ calendar_event_id        │     │ calendar_event_id   │     │ calendar_event_id   │
└──────────────────────────┘     └─────────────────────┘     └─────────────────────┘

┌─────────────────────────┐     ┌─────────────────────┐
│ contact_interactions    │     │ time_entries        │
├─────────────────────────┤     ├─────────────────────┤
│ id (PK)                 │     │ id (PK)             │
│ title                   │     │ description         │
│ description             │     │ start_time          │
│ start_datetime          │     │ end_time            │
│ end_datetime            │     │ projectid           │
│ contactid               │     │ employeeid          │
│ calendar_sync_enabled   │     │ calendar_sync_enabled│
│ calendar_event_id       │     │ calendar_event_id   │
└─────────────────────────┘     └─────────────────────┘
```

## Entity Relationships

1. **Unified Calendar Events to Entity Tables**

   - One-to-one relationship based on polymorphic association
   - `entity_type` specifies which table to join with
   - `entity_id` specifies the record ID in that table

2. **Calendar Events to Google Calendar**
   - `google_event_id` links the event to its Google Calendar counterpart
   - `calendar_id` specifies which Google Calendar contains the event
   - `sync_enabled` determines if changes should propagate to Google Calendar

## Data Synchronization

1. **During Transition**

   - Database triggers maintain dual-write consistency
   - Entity tables still have `calendar_event_id` field
   - Updates to entity tables automatically synchronize to unified table

2. **End State**
   - All calendar operations route through unified table
   - Entity tables only need foreign keys to unified table
   - Simplifies changes to calendar data

## Advantages

1. **Consistent Data Model**

   - All calendar events follow the same structure
   - Type-safe with TypeScript interfaces
   - Simplifies API endpoints and services

2. **Improved Queryability**

   - Can query across all event types
   - Efficient indexing on common searches
   - Better support for calendar views

3. **Single Source of Truth**
   - One location for calendar integration
   - Clearer separation of concerns
   - Easier to maintain and extend

## Migration Path

1. All new calendar functionality uses the unified table
2. Legacy code gradually migrates to use the unified table
3. Eventually, direct calendar fields can be removed from entity tables
