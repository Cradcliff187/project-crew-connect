# Project Overview Tab Redesign Audit

## Elements Analysis

| Element                     | Purpose                                    | Status            | Issues                                                                          |
| --------------------------- | ------------------------------------------ | ----------------- | ------------------------------------------------------------------------------- |
| **Project Name & ID**       | Primary identifier                         | Keep              | No issues - critical information                                                |
| **Created On Card**         | Shows project creation date                | Move/Merge        | Low-value standalone card; should be merged with Key Dates                      |
| **Client Card**             | Shows client name and ID                   | Keep              | Important context, but can be redesigned                                        |
| **Financial Snapshot Card** | Key financial metrics                      | Keep & Enhance    | Values are not visually scannable; lacks hierarchy                              |
| **Project Health Card**     | Visual indicator of budget/schedule status | Keep & Enhance    | Simple progress bar doesn't communicate clear status; "TBD" values lack utility |
| **Project Description**     | Text description of project                | Keep & Redesign   | No card structure; lacks visual prominence for an important context element     |
| **Key Dates Card**          | Shows start/end dates                      | Keep & Enhance    | Critical timeline info; overdue states need clearer visual treatment            |
| **Edit/Add Buttons**        | Contextual actions                         | Keep & Reorganize | Universal actions should be grouped consistently                                |

## Accessibility & Clarity Issues

1. **Color Usage**:

   - Negative GP likely shown in red without secondary indicators (fails color-blind accessibility)
   - Budget status relies solely on color coding

2. **Empty States**:

   - "TBD" values aren't actionable
   - Empty description shows generic message without clear CTA

3. **Visual Hierarchy**:

   - Cards have equal visual weight regardless of importance
   - Financial data presented as plain text without visual scanning aids

4. **Layout Consistency**:

   - Inconsistent card titles (some have icons, some don't)
   - Inconsistent content padding/spacing

5. **Action Discoverability**:
   - Edit/Add buttons lack clear association with specific content

## Information Architecture Proposal

Reorganize content into these logical zones:

1. **Header Summary Bar**

   - Project Name & ID (with status badge)
   - Client information
   - Critical metrics (Budget remaining, Schedule status)
   - Primary actions (Edit, Add)

2. **Key Project Details**

   - Project Description (with rich text/formatting)
   - Key Dates (Start/End with visual timeline)

3. **Financial KPIs**

   - Contract value
   - Budget
   - Spent amount
   - Estimated GP (with visual percentage indicator)

4. **Health & Status**
   - Budget health (with clear status indicators beyond just color)
   - Schedule health (with clear status indicators)
   - Visual indicators for trend analysis

## Rationale for Changes

1. **Improved Scanability**

   - Group related information to reduce cognitive load
   - Use visual hierarchy to emphasize important metrics
   - Implement consistent spacing and alignment

2. **Enhanced Accessibility**

   - Add secondary indicators beyond color (icons, patterns, labels)
   - Improve contrast ratios for text elements
   - Ensure interactive elements have sufficient hit targets

3. **Better Space Utilization**

   - Eliminate redundant cards for low-value singular data points
   - Combine related information into unified components
   - Create responsive layout that adapts to different screen sizes

4. **Clearer Call-to-Actions**
   - Associate actions with relevant content
   - Provide empty state CTAs that guide users to next steps
   - Group primary actions for consistency

## Follow-up Tickets

1. Create new Figma components:

   - Metric Display component with label/value/trend
   - Combined Project Header component
   - Enhanced Project Health component with dual indicators

2. Refactors needed:

   - Consolidate separate card components into unified containers
   - Extract financial metrics logic into reusable hooks
   - Create standardized formatter utilities for various data types

3. Data updates:
   - Add computed/derived fields for trend analysis
   - Create more fine-grained status indicators beyond binary states
