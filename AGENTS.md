# AGENTS.md — Express Seller Web App

## 1. Project Overview

Build a modern Express Seller web application that helps online sellers in Cambodia book and manage parcel deliveries quickly.

The main goal is to make delivery booking simple, fast and accessible.

### Core Product Principles

- Booking page is the homepage.
- Users can start booking without authentication.
- Authentication is required only when submitting a booking.
- Keep the booking experience on one page.
- Avoid unnecessary steps, navigation and complicated interfaces.
- Prioritize usability and speed for sellers handling multiple orders.
- Design mobile-first while providing an excellent desktop experience.

---

## 2. Technology Stack

Use the following technologies:

- Latest stable Next.js with App Router.
- React.
- TypeScript with strict mode.
- Tailwind CSS.
- Yarn as the package manager.
- NVM for Node.js version management.
- Lucide React for icons.
- React Hook Form for form management.
- Yup or Zod for validation.
- Vercel for deployment.

Do not introduce additional libraries without a clear technical reason.

Use the existing project configuration whenever possible. Do not unnecessarily replace dependencies or reinitialize the project.

---

## 3. Architecture Principles

Follow Clean Architecture with feature-based organization and Atomic Design.

### Separation of concerns

- UI components handle presentation.
- Hooks handle UI-related state and interactions.
- Services handle business operations.
- Repositories handle data access.
- Schemas handle validation.
- Types define shared contracts.
- Utilities contain reusable pure functions.

Avoid mixing business logic, API logic and presentation in the same component.

### Component rules

- Atoms: basic reusable UI elements.
- Molecules: small combinations of UI elements.
- Organisms: complete interface sections.
- Templates: page-level layouts.
- Pages: compose features and layouts.

Do not over-engineer simple components.

---

## 4. Naming Conventions

All project filenames and custom folder names must use kebab-case.

Examples:

- `booking-form.tsx`
- `booking-summary.tsx`
- `location-picker.tsx`
- `authentication-modal.tsx`
- `use-booking.ts`
- `booking-service.ts`
- `booking-schema.ts`

React components must use PascalCase.

Examples:

- `BookingForm`
- `BookingSummary`
- `LocationPicker`

Variables and functions must use camelCase.

Constants must use UPPER_SNAKE_CASE when appropriate.

Use meaningful names. Avoid abbreviations and unclear naming.

Next.js reserved filenames must follow framework conventions, such as `page.tsx`, `layout.tsx`, `route.ts` and `loading.tsx`.

---

## 5. Code Quality

- Use TypeScript strict mode.
- Avoid `any`.
- Prefer explicit types and interfaces.
- Keep components small and focused.
- Aim for 150–200 lines per source file.
- Split files when responsibilities become too large.
- Avoid duplicated logic.
- Use reusable components when reuse provides real value.
- Avoid unnecessary abstractions.
- Avoid deeply nested conditions.
- Use early returns where appropriate.
- Handle loading, empty and error states.
- Remove unused imports, variables and code.
- Do not use `console.log` for permanent application behavior.
- Write readable and maintainable code.

Do not sacrifice readability just to meet the LOC target.

---

## 6. UI/UX Design Rules

The interface must be modern, minimal, premium and easy to understand.

### Visual style

- Clean and spacious layouts.
- Neutral backgrounds.
- Clear typography hierarchy.
- Consistent spacing.
- Subtle borders and shadows.
- Rounded corners around 12–16px.
- Consistent icon sizes.
- Clear visual hierarchy.
- Accessible contrast.
- Subtle interactions and animations.

### Tailwind rules

- Use Tailwind utility classes.
- Avoid unnecessary custom CSS.
- Do not use `bg-gradient`.
- Use `bg-linear` only when a gradient genuinely improves the design.
- Avoid excessive arbitrary values.
- Keep class names readable.
- Extract repeated styles into reusable components when appropriate.

### UX rules

- Keep forms short and straightforward.
- Use clear labels and helpful placeholders.
- Show validation messages near their inputs.
- Avoid unnecessary confirmation pages.
- Provide immediate feedback after user actions.
- Disable buttons during submission.
- Prevent accidental duplicate submissions.
- Use sensible defaults.
- Make the primary action visually obvious.
- Ensure touch-friendly mobile controls.
- Avoid horizontal scrolling.

Do not add UI elements simply for decoration.

---

## 7. Booking Business Rules

These rules must always be respected.

### Public booking

- `/` opens the booking page directly.
- Visitors do not need to log in to view or complete the form.
- Pickup and drop-off selection are public.
- Recipient information is public.
- Parcel information is public.
- COD configuration is public.
- Booking review is public.

### Authentication

- Authentication is required only when the user submits a booking.
- Preserve all booking form data while authentication is in progress.
- After successful authentication, automatically continue the pending booking.
- Never force users to re-enter their booking information.

### COD

- COD is optional.
- When disabled, hide the COD amount input.
- When enabled, require a valid positive amount.
- Display COD separately from the delivery fee.
- Never add COD to the delivery fee total.

### Booking

- Validate all required information before submission.
- Prevent duplicate booking submissions.
- Display meaningful error messages.
- Show booking success only after submission succeeds.
- Never fabricate real booking references or tracking numbers in production.

---

## 8. Authentication and Security

The intended production architecture is:

Browser → Next.js Route Handlers → External APIs.

Never call Consumer API or Express API directly from browser code.

Rules:

- Keep upstream API credentials server-side.
- Never expose secrets through `NEXT_PUBLIC_` environment variables.
- Use secure server-managed sessions.
- Use HttpOnly, Secure and appropriate SameSite cookie settings.
- Validate all incoming server requests.
- Do not trust client-submitted user identity or booking information.
- Handle expired sessions.
- Do not log PINs, tokens or sensitive personal information.
- Apply appropriate request validation and error handling.

For the initial UI prototype, use mock authentication and mock booking submission only. Do not implement real authentication or external API integration unless explicitly requested.

---

## 9. API and Data Layer

When real integration is requested:

- Use Next.js Route Handlers as the backend-for-frontend layer.
- Create reusable server-side API clients.
- Keep external API contracts in dedicated types.
- Separate API communication from UI components.
- Normalize API errors.
- Set appropriate request timeouts.
- Validate API responses.
- Never invent endpoints, request fields or response structures.
- Inspect existing API documentation before implementation.
- Clearly identify missing API contracts instead of guessing.

Use mock repositories for UI-only development.

Keep mock data separate from presentation components.

---

## 10. Responsive Design

Support:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

Mobile requirements:

- Single-column booking form.
- Full-width inputs and primary buttons.
- Compact expandable booking summary.
- Touch-friendly controls.
- No horizontal scrolling.
- Clear location selection experience.

Desktop requirements:

- Booking form as the primary content.
- Delivery summary in a secondary column.
- Sticky summary when useful.
- Compact navigation.

---

## 11. State Management

Use local React state for simple UI interactions.

Use React Hook Form for booking forms.

Do not introduce Redux or another global state library unless application complexity justifies it.

Keep form state independent from modal state and API submission state.

Persist pending booking information safely when required by the authentication flow. Never store authentication tokens in localStorage.

---

## 12. Accessibility

- Use semantic HTML.
- Associate labels with inputs.
- Support keyboard navigation.
- Provide visible focus states.
- Use accessible modal behavior.
- Add appropriate ARIA attributes where needed.
- Do not rely on color alone to communicate status.
- Provide accessible error messages.

---

## 13. Development Workflow

Before implementing a feature:

1. Inspect the existing project structure.
2. Understand existing components and conventions.
3. Identify the feature's responsibilities.
4. Plan the smallest reasonable implementation.
5. Reuse existing utilities and components.

While implementing:

1. Build reusable UI components.
2. Keep business logic outside presentation components.
3. Implement responsive layouts.
4. Handle all relevant UI states.
5. Keep code organized by feature.

After implementation:

1. Check TypeScript errors.
2. Run linting.
3. Check the production build.
4. Review changed files.
5. Fix unused code and inconsistent naming.

Do not overwrite working code unnecessarily.

Do not introduce unrelated changes.

Do not start or verify a development server unless explicitly requested.

---

## 14. AI Agent Behavior

Act as a senior frontend engineer and UI/UX designer.

When receiving a task:

- Understand the user requirement before coding.
- Prioritize the simplest solution that satisfies the requirement.
- Follow existing architecture and naming conventions.
- Do not invent additional product requirements.
- Do not add unnecessary dependencies.
- Do not over-engineer.
- Do not replace existing functionality without justification.
- Explain important architectural decisions briefly.
- Identify assumptions and missing requirements.
- Ask questions only when an essential decision cannot reasonably be made.

For large tasks, implement one feature at a time.

Do not generate the entire application in one oversized component.

Do not claim a feature works if it has only been visually implemented or simulated.

Clearly distinguish mock functionality from real integration.

---

## 15. Definition of Done

A feature is complete when:

- It meets the requested requirements.
- It follows project architecture.
- Filenames follow kebab-case.
- Components are reusable where appropriate.
- TypeScript types are correct.
- UI is responsive.
- Loading, empty and error states are handled.
- Accessibility basics are covered.
- No unrelated code is changed.
- Lint and production build pass when verification is requested.

**Golden Rule: Build a simple, polished and maintainable product. Every screen and interaction must make the seller's delivery booking experience easier.**

