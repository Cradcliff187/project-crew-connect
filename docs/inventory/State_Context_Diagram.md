# State & Context Diagram

This document maps out the React context providers in the application and their consumers.

## Context Providers

### AuthContext

The `AuthContext` provides authentication state management across the application.

**Provider**: `AuthProvider` in `src/contexts/AuthContext.tsx`

**Context Value**:

```typescript
{
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Primary Consumers**: `RouteGuard`, `Header`, pages requiring auth state

### SidebarContext

The `SidebarContext` manages the state of the application sidebar.

**Provider**: `SidebarProvider` in `src/components/ui/sidebar.tsx`

**Context Value**:

```typescript
{
  isOpen: boolean;
  toggle: () => void;
  // Additional methods for sidebar state management
}
```

**Primary Consumers**: `Sidebar`, `SidebarContent`, `Layout`

### FormFieldContext

The `FormFieldContext` provides form field state to form components.

**Provider**: `FormField` in `src/components/ui/form.tsx`

**Context Value**:

```typescript
{
  name: string;
}
```

**Primary Consumers**: Form field components

### ChartContext

The `ChartContext` provides chart configuration and state to chart components.

**Provider**: `ChartContainer` in `src/components/ui/chart.tsx`

**Context Value**:

```typescript
{
  // Chart-related state and configuration
}
```

**Primary Consumers**: Chart visualization components

### CarouselContext

The `CarouselContext` manages carousel state for the carousel component.

**Provider**: `Carousel` in `src/components/ui/carousel.tsx`

**Context Value**:

```typescript
{
  // Carousel-related state and methods
}
```

**Primary Consumers**: Carousel item components

## Mermaid Diagram

```mermaid
graph TD
    %% Context providers
    Auth[AuthProvider]
    Sidebar[SidebarProvider]
    Form[FormFieldContext]
    Chart[ChartContext]
    Carousel[CarouselContext]

    %% Main app components
    App[App]
    Layout[Layout]
    RouteGuard[RouteGuard]
    Header[Header]

    %% Page components
    Dashboard[Dashboard]
    Projects[Projects]
    Estimates[Estimates]
    WorkOrders[WorkOrders]
    TimeTracking[TimeTracking]

    %% UI Components
    SidebarComp[Sidebar Components]
    FormComp[Form Components]
    ChartComp[Chart Components]
    CarouselComp[Carousel Components]

    %% Relationships
    Auth --> App
    App --> RouteGuard
    RouteGuard --> Layout
    Layout --> Sidebar
    Sidebar --> SidebarComp

    %% Auth consumers
    Auth --> RouteGuard
    Auth --> Header
    Auth --> Dashboard
    Auth --> Projects
    Auth --> Estimates
    Auth --> WorkOrders
    Auth --> TimeTracking

    %% Sidebar consumers
    Sidebar --> Layout
    Sidebar --> Header

    %% Form context consumers
    Form --> FormComp

    %% Chart context consumers
    Chart --> ChartComp

    %% Carousel context consumers
    Carousel --> CarouselComp

    %% Page rendering
    Layout --> Dashboard
    Layout --> Projects
    Layout --> Estimates
    Layout --> WorkOrders
    Layout --> TimeTracking

    %% Component usage in pages
    Dashboard --> ChartComp
    Projects --> FormComp
    Estimates --> FormComp
    WorkOrders --> FormComp
    TimeTracking --> FormComp

    classDef context fill:#f9f,stroke:#333,stroke-width:2px;
    classDef component fill:#bbf,stroke:#333,stroke-width:1px;
    classDef page fill:#bfb,stroke:#333,stroke-width:1px;

    class Auth,Sidebar,Form,Chart,Carousel context;
    class Layout,RouteGuard,Header,SidebarComp,FormComp,ChartComp,CarouselComp component;
    class Dashboard,Projects,Estimates,WorkOrders,TimeTracking page;
```
