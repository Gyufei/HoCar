# Personal Hub Redesign Design

## Goal

Convert the project from a single-purpose water/electricity calculator into a lightweight personal admin platform. The first release should provide a reusable authenticated app shell, a redesigned login page, a dashboard home, and a clear module structure so future personal services such as image hosting and demo galleries can be added without reworking layout and navigation.

## Product Direction

The product should feel like a lightweight personal control panel, not an enterprise operations suite. It should be calm, practical, and extensible. The current water and electricity calculators become the first module group, named "生活账单". Future modules such as "图床服务" and "个人 Demo" should appear as reserved navigation entries and dashboard cards with empty states.

## Design System

Use a monochrome foundation with one blue accent:

- Background: `#FAFAFA` / shadcn `background`
- Text: `#09090B` / shadcn `foreground`
- Primary surface: white cards with visible borders
- Accent: blue, mapped through shadcn `primary`
- Border and muted text should stay high-contrast enough for light mode

Keep the existing Geist font stack from `next/font`. The UI/UX search recommended Fira for data dashboards, but this project is a personal hub rather than a dense analytics product, so Geist is a better fit with the current code and desired simplicity.

## Component Strategy

Prefer shadcn/ui components whenever a fit exists. Do not hand-roll component behavior that shadcn already provides.

Use shadcn for:

- Sidebar navigation: `sidebar`
- Cards and dashboard panels: `card`
- Buttons and actions: `button`
- Forms and inputs: `input`, `label`
- Separators and layout rhythm: `separator`
- Empty states and grouped content using shadcn primitives
- Mobile sidebar state through `SidebarProvider` and `SidebarTrigger`

Custom code should compose these components, provide navigation data, and apply project-specific spacing, labels, and route behavior. If a future component choice is ambiguous, ask before inventing a custom component.

## Information Architecture

Initial navigation:

- 概览: `/`
- 生活账单
  - 电费: `/bills/electricity`
  - 水费: `/bills/water`
- 图床服务: `/images`
- 个人 Demo: `/demos`
- 系统设置: `/settings`

The old tool routes are intentionally removed. This is a personal project, so keeping compatibility redirects would add unnecessary historical debt.

## Layout

Authenticated pages use an app shell:

- Left sidebar for module navigation
- Top bar with `SidebarTrigger`, page title or breadcrumbs, and user actions
- Main content area with constrained width and consistent padding
- Skip link to main content for keyboard users

The root layout should stop centering every page. Login and authenticated pages need separate layout concerns.

## Login Page

The login page should be redesigned around the Personal Hub identity. It should keep the existing NextAuth credentials flow but update copy, spacing, and surfaces. It should not look like the old Home Calc login. Form labels remain visible above inputs, errors are inline, and focus states must be clear.

## Dashboard Home

The dashboard home replaces the old calculator chooser. It should show:

- A concise page header
- Quick module cards for bills, image hosting, demos, and settings
- Recent bill summary or latest records when available
- Helpful empty states for not-yet-built modules

Dashboard cards should use shadcn `Card` and avoid emoji icons. Use a single icon family, preferably the icon library installed by shadcn setup.

## Bills Module

Existing `/ele` and `/water` behavior remains intact:

- Local storage reading memory
- Calculation flow
- Save/delete bill records
- History loading
- Auth protection

The pages should be restyled as app content pages:

- Remove internal "返回主页" buttons
- Use the sidebar for navigation
- Replace alert-heavy visual structure where practical with inline shadcn feedback
- Keep functional changes minimal in this first redesign

## Accessibility And UX Rules

- Active navigation state must be visually obvious.
- Keyboard users must be able to skip navigation and reach main content.
- Heading hierarchy should be sequential.
- Empty states should guide the user.
- Clickable cards and buttons need pointer cursors and visible hover/focus states.
- No emoji UI icons.
- Test responsive behavior at mobile, tablet, desktop, and wide desktop widths.

## Out Of Scope For First Release

- Multi-user role and permission system
- Full dynamic module marketplace
- Implementing image hosting business logic
- Implementing demo gallery business logic
- Deep refactor of bill calculation logic beyond layout integration
