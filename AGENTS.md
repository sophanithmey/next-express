# AGENTS.md — Express Seller Web App

## 1. Project Overview

Build a modern Express Seller web application that helps online sellers in Cambodia book and manage parcel deliveries quickly.

The main goal is to make delivery booking simple, fast and accessible.

### Core Product Principles

- **One page. One form. One clear action.**
- Booking page is the homepage (`/`).
- Users can start booking immediately without authentication.
- Authentication is required only when submitting a booking.
- Keep the booking experience on one page without unnecessary review steps or wizards.
- Prioritize usability, speed, and space efficiency for busy sellers handling multiple orders.
- Design mobile-first while providing a polished desktop experience.

---

## 2. Technology Stack

Use the following technologies:

- **Next.js**: Latest stable Next.js with App Router.
- **Frontend**: React 19, TypeScript with strict mode.
- **Styling**: Tailwind CSS (use `bg-linear` only if needed; never use deprecated `bg-gradient`).
- **Package Manager**: Yarn.
- **Runtime**: Node.js managed via NVM (`.nvmrc`).
- **Icons**: Lucide React.
- **Forms & Validation**: React Hook Form with Zod.
- **Testing**: Vitest with React Testing Library.
- **Deployment**: Vercel.

Do not introduce additional libraries without a clear technical reason.

Use existing project dependencies and configurations. Do not reinitialize the project.

---

## 3. Architecture Principles

Follow Clean Architecture with feature-based organization and Atomic Design.

### Separation of Concerns

- **UI Components** (`src/components/`): Handle presentation only.
  - `atoms/`: Basic reusable UI elements (buttons, inputs, badges).
  - `molecules/`: Small combinations of UI elements (rider-note-input, location-picker-modal, auth-modal).
  - `organisms/`: Complete interface sections (pickup-section, dropoff-section, parcel-cod-section, booking-summary).
  - `templates/`: Page-level layouts.
- **Features** (`src/features/`): Group domain logic by feature.
  - `schemas/`: Zod validation schemas.
  - `types/`: Shared TypeScript domain models and contracts.
  - `services/`: Business logic, fee calculations, and domain orchestrators.
  - `repositories/`: Data access layer (mock repositories for UI prototype).
  - `data/`: Mock fixtures and test datasets.
- **Hooks** (`src/hooks/`): Reusable UI-related state and side effects.
- **Utilities** (`src/lib/`): Pure helper functions, formatting, and DOM helpers.

Avoid mixing business logic, data fetching, and presentation in the same component.

---

## 4. Naming Conventions

All project filenames and custom folder names must use `kebab-case`.

Examples:

- `booking-form.tsx`
- `booking-summary.tsx`
- `dropoff-stop-item.tsx`
- `rider-note-input.tsx`
- `location-picker-modal.tsx`
- `authentication-modal.tsx`
- `use-booking.ts`
- `booking-service.ts`
- `booking-schema.ts`

React components must use `PascalCase`:

- `BookingForm`
- `BookingSummary`
- `DropoffStopItem`
- `RiderNoteInput`
- `LocationPickerModal`

Variables, functions, and hook names must use `camelCase`.

Constants must use `UPPER_SNAKE_CASE` when appropriate.

Next.js reserved filenames must follow framework conventions (`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`).

---

## 5. Code Quality & File Size Limits

- **TypeScript Strict Mode**: Zero TypeScript errors (`yarn tsc --noEmit`).
- **No `any`**: Use explicit interfaces and types.
- **File Size Target: 150–200 lines of code (LOC)**:
  - Keep components small, focused, and single-purpose.
  - **Mandatory Component Splitting**: When an organism or feature component exceeds 200 lines (e.g. `dropoff-section.tsx`), immediately extract cohesive sub-components into their own files (e.g. `dropoff-stop-item.tsx`, `rider-note-input.tsx`).
- **Readable & Maintainable**: Use early returns, avoid deeply nested conditions, and extract repeated patterns into reusable components.
- **Clean Imports & Exports**: Remove unused variables, dead code, and leftover debug statements.
- **No `console.log`**: Never leave permanent `console.log` in production code.
- **Handle All States**: Explicitly handle loading, error, empty, and disabled states.

---

## 6. UI/UX Design Rules

The interface must be modern, minimal, premium, and easy to understand.

### Visual Style

- **Palette**: Clean white and neutral slate backgrounds (`bg-slate-50`, `bg-white`).
- **Brand Color**: Emerald green (`emerald-600`, `emerald-700`, `hover:bg-emerald-700`, `bg-emerald-50` for subtle active states).
- **Typography**: Dark charcoal (`text-slate-900`), muted secondary labels (`text-slate-500`), subtle micro-copy (`text-xs`).
- **Borders & Radii**: Subtle borders (`border-slate-200`, `border-slate-100`) and rounded corners (12–16px, `rounded-xl` or `rounded-2xl`).
- **Spacing Efficiency**:
  - Save vertical space for secondary or optional sections.
  - Avoid deeply nested cards inside cards.
  - Prefer subtle dividers (`border-t border-slate-100`) and compact groups over giant separate cards.
  - Use clear `(Optional)` pill badges or muted labels to signal non-required fields without clutter.

### Tailwind Rules

- Use Tailwind CSS utility classes exclusively.
- Do not use `bg-gradient`. Use Tailwind `bg-linear` only when a subtle gradient genuinely enhances visual hierarchy.
- Avoid arbitrary values (`h-[37px]`) unless strictly required for third-party widget alignment.
- Keep class names readable and logically ordered (layout → spacing → styling → interactive states).

### Interaction & Form UX Rules

- Keep forms short, clear, and straightforward.
- Show validation messages directly adjacent to the relevant input field.
- **No Duplicate Buttons**: Every input must have at most one primary trigger button (e.g. avoid having "Pin on Map" in both the section header/label and beside the address input).
- Disable submission buttons and show spinner states during async actions.
- Prevent duplicate submissions by guarding submission flags.
- Ensure touch-friendly target sizes (min 44px) on mobile controls.
- Prevent horizontal scrolling on all viewport sizes.

---

## 7. Booking Business Rules & Field Validation

These business rules must always be respected across forms, schemas, and state:

### A. Pickup Location
- **Pickup Address / Street**: **Required** (min 3 characters).
- **Contact Name**: **Optional** (online sellers often have default warehouse names or skip personal names).
- **Contact Phone**: **Optional** (fallback to authenticated seller account).
- **Rider Note & Photo Upload**: **Optional** (special pickup instructions, gate code, warehouse photo).
- **Geolocation**: Provide a `[ 🎯 Use current location ]` button that queries browser GPS and formats Phnom Penh coordinates.

### B. Drop-off Destination & Recipient (Multi-Drop)
- **Recipient Name**: **Optional** (sellers frequently ship orders labeled only by phone and street).
- **Recipient Phone Number**: **Required** (must be 8–15 digits; validates standard Cambodian phone formats like `012 998 877`).
- **Drop-off Address / Street**: **Required** (min 3 characters).
- **Destination Rider Note & Photo Upload**: **Optional** (house landmarks, delivery gate notes, recipient location photo).
- **Single Map Pin**: Provide a single "Pin on Map" action next to the address input.

### C. Parcel Information & Cash on Delivery (COD)
- **Parcel Number / Seller Order ID**: **Required** (sensible default like `LIVE-0914` or seller order reference).
- **Parcel Description**: **Optional** (e.g. "Apparel / Retail Parcel").
- **COD Toggle**: **Optional** (defaults to disabled/off).
- **COD Amount**:
  - When disabled: Hide COD amount input.
  - When enabled: **Required positive number** (`> 0`, currency USD `$`).
  - **COD is NEVER added to the delivery fee total**. It is collected from the buyer and remitted to the seller. Always display COD separately in all summary cards.

---

## 8. Multi-Drop Destination Architecture

Express Seller supports sequential multi-drop deliveries within a single booking dispatch:

### Data Model Contract
```typescript
export interface DropoffStop {
  id: string;
  recipientName?: string;
  recipientPhone: string;
  address: string;
  coordinates?: Coordinates;
  riderNote?: string;
  imageUrl?: string;
}
```

### Synchronization Rule
- The canonical list of destinations is stored in `dropoffs: DropoffStop[]`.
- For backwards compatibility with single-stop summaries or external APIs, always keep `bookingForm.recipient` and `bookingForm.dropoff` synchronized with `dropoffs[0]`.
- First destination (`Stop 1`) cannot be deleted.
- Subsequent destinations (`Stop 2`, `Stop 3`, etc.) include a remove button and stop index badges (`Stop 1`, `Stop 2`, etc.).

### Multi-Drop Pricing Model
- Base delivery fee covers Stop 1 (e.g., $1.75).
- Each additional drop-off stop adds an incremental dispatch fee (e.g., +$0.75 per extra stop).
- Summary cards must clearly display both the stop count and the itemized delivery charge breakdown.

---

## 9. Location, GPS & Map Pinning Rules

### Pin on Map Modal (`LocationPickerModal`)
- Use a single trigger per location input.
- Modal features:
  - Interactive Google Maps embed preview with draggable marker coordinates.
  - Google Maps link parser: extracts `@lat,lng` or `q=lat,lng` when sellers paste raw Google Maps share URLs.
  - Quick-select zone presets for Phnom Penh commercial hubs (BKK1, Toul Kork, Daun Penh, Sen Sok, Chbar Ampov, etc.).
  - Apply Coordinates & Address directly back to the targeted form stop.

### Geolocation Current Location Helper
- Pickup address supports one-tap browser geolocation (`navigator.geolocation.getCurrentPosition`).
- On success: Format address as `Current Location (lat, lng), Phnom Penh` and store coordinate object.
- On error/denial: Display clear inline feedback without crashing or blocking manual address entry.

---

## 10. Rider Notes & Media Attachment Rules

Any pickup or drop-off location can include courier instructions and photo attachments:

- Use the unified `RiderNoteInput` molecule component (`src/components/molecules/rider-note-input.tsx`).
- Provide:
  - Clean textarea for optional instructions ("Leave with security", "Ring bell at red gate").
  - Camera/Photo upload trigger (`<input type="file" accept="image/*">`).
  - Thumbnail preview with instant remove action.
  - In mock UI mode, store images via browser `URL.createObjectURL(file)` or base64 data URLs.

---

## 11. Authentication & Security Flow

The application uses an **Unauthenticated First, Gated at Confirmation** pattern:

1. **Public Exploration**: Anyone can visit `/`, choose pickup/drop-off stops, toggle COD, and view estimated fees.
2. **Pending Booking Preservation**:
   - When the user clicks "Confirm Booking", validate all required form fields.
   - If validation fails, highlight invalid inputs with clear error messages.
   - If validation passes and user is not authenticated, open `AuthenticationModal`.
   - **Never clear or reset form fields during the authentication flow**.
3. **Simulated Authentication**:
   - Phone number input → Continue → 4-digit PIN verification.
   - Test credentials for mock mode: Phone `012888999`, PIN `1234`.
4. **Automatic Continuation**:
   - Upon successful verification, authenticate the session and immediately submit the pending booking without forcing the user to click confirm again.
   - Navigate to `/booking/success` with the completed booking details and generated tracking reference.

### Production Security Boundaries
- Browser code must never call external Express or carrier APIs directly.
- Next.js Route Handlers (`/api/...`) act as the Backend-For-Frontend (BFF).
- API credentials, bearer tokens, and secrets remain server-side.
- Session cookies must be `HttpOnly`, `Secure`, and `SameSite=Lax`.

---

## 12. State Management

- Use **React Hook Form** for form inputs and field-level validation with Zod schemas.
- Use local React state (`useState`, `useCallback`, `useMemo`) for section expansions, modal visibility, and UI toggles.
- Keep form state independent from modal state and submission network state.
- Do not introduce Redux, Zustand, or heavy state managers unless the application scope explicitly outgrows React context.

---

## 13. Testing & Verification Requirements

Before declaring any feature complete:

1. **TypeScript Typecheck**:
   ```bash
   yarn tsc --noEmit
   ```
   Must pass with 0 errors.

2. **Unit & Integration Tests**:
   ```bash
   yarn test
   ```
   All test suites in `tests/` must pass. Add unit tests when adding new business logic, fee calculators, or schemas.

3. **Production Build**:
   ```bash
   yarn build
   ```
   Must compile cleanly without build errors, missing exports, or bundle failures.

---

## 14. Common Anti-Patterns to Avoid

- **DO NOT** create separate review or multi-step wizard pages. The sticky summary beside the form already provides real-time review.
- **DO NOT** add Cash on Delivery (COD) amount to the delivery fee total.
- **DO NOT** make recipient name mandatory. (Sellers often deliver to phone numbers + addresses only).
- **DO NOT** duplicate map pin buttons in both the section header and next to the input.
- **DO NOT** grow single component files beyond 200 lines. Extract sub-components promptly.
- **DO NOT** use `bg-gradient` in Tailwind classes.
- **DO NOT** store auth tokens or sensitive credentials in `localStorage`.
- **DO NOT** reinitialize project configuration or install duplicate libraries.

---

## 15. Definition of Done

A task or feature is complete only when:

- [ ] All requested product capabilities are implemented.
- [ ] Code adheres to Clean Architecture and Atomic Design.
- [ ] All filenames use `kebab-case`.
- [ ] Component files stay within the 150–200 LOC target.
- [ ] TypeScript types are strict and explicit (no `any`).
- [ ] UI is fully responsive (desktop two-column, mobile single-column).
- [ ] Loading, error, empty, and disabled states are handled.
- [ ] `yarn tsc --noEmit` succeeds with 0 errors.
- [ ] `yarn test` passes all tests.
- [ ] `yarn build` completes with exit code 0.

**Golden Rule: Build a simple, polished, and maintainable product. Every screen and interaction must make the seller's delivery booking experience faster and easier.**
