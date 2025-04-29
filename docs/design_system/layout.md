# Design System: Layout

This document describes the main application layout structure.

## Core Components

- **`src/components/layout/Layout.tsx`:** The main wrapper component. Uses `SidebarProvider` and arranges `AppSidebar`, `Header`, and the main content area using `SidebarInset`.
- **`src/components/ui/sidebar.tsx`:** A complex, custom sidebar system providing context (`SidebarProvider`, `useSidebar`), responsiveness, multiple variants (`sidebar`, `floating`, `inset`), collapse modes (`offcanvas`, `icon`), tooltips, submenus, etc.
- **`src/components/layout/AppSidebar.tsx`:** Implements the sidebar content, using the components from `ui/sidebar.tsx`. Displays the logo and maps the `mainNav` array to generate navigation items (`SidebarMenuButton`). Includes placeholder user/auth display in the footer.
- **`src/components/layout/Header.tsx`:** Renders the sticky top header. Includes the `SidebarTrigger` and a dynamic page title derived from the route. Contains a placeholder notification bell.
- **`src/components/common/layout/PageHeader.tsx`:** A reusable component for page-level headers within the main content area. Provides slots for title, subtitle, back button, and actions.
- **`src/components/layout/PageTransition.tsx`:** A simple wrapper using `framer-motion` to apply a consistent fade/slide-in animation to page content.

## Structure

The typical page structure is:

```tsx
<SidebarProvider>
  {' '}
  {/* From ui/sidebar.tsx */}
  <div className="flex h-screen w-full ...">
    <AppSidebar /> {/* From layout/AppSidebar.tsx */}
    <SidebarInset>
      {' '}
      {/* From ui/sidebar.tsx */}
      <Header /> {/* From layout/Header.tsx */}
      <main className="flex-1 overflow-y-auto ...">
        <PageTransition>
          {' '}
          {/* From layout/PageTransition.tsx */}
          {/* Optional: PageHeader from common/layout/PageHeader.tsx */}
          {/* Page-specific content goes here (often wrapped in Cards) */}
          <Outlet /> {/* Renders nested route component */}
        </PageTransition>
      </main>
    </SidebarInset>
  </div>
</SidebarProvider>
```

## Usage Guidelines

- All main pages should be rendered within the `Layout` component (via `react-router-dom` nesting).
- Wrap main page content with `PageTransition` for consistent entry animation.
- Use the `PageHeader` component for standardized page titles and actions within the main content area.
- Utilize the various components exported by `ui/sidebar.tsx` (`SidebarMenu`, `SidebarMenuButton`, `SidebarGroup`, etc.) to build navigation within `AppSidebar.tsx`.
- Follow the conventions established in `AppSidebar.tsx` for defining navigation items (using `mainNav` array structure).
