# Coding Standards & Agent Rules — WingExpress Web App

> **Single Source of Truth**: See [`AGENTS.md`](file:///Users/sophanith.mey/UAE/next-express/AGENTS.md) in the project root for the authoritative architecture, business rules, and UI guidelines.

## Quick Reference Rules for AI Agents

### 1. File & Component Standards
- **Naming**: Strictly `kebab-case` for files/folders (`dropoff-stop-item.tsx`, `use-booking.ts`).
- **File Length Target**: **150–200 LOC per file**. When a component exceeds 200 LOC, split out sub-components immediately.
- **Atomic Hierarchy**:
  - `src/components/atoms/`: Buttons, inputs, badges.
  - `src/components/molecules/`: Compound inputs (`rider-note-input.tsx`, `location-picker-modal.tsx`, `authentication-modal.tsx`).
  - `src/components/organisms/`: Section components (`pickup-section.tsx`, `dropoff-section.tsx`, `parcel-cod-section.tsx`, `booking-summary.tsx`).
- **TypeScript**: Strict mode with zero `any`.

### 2. Form & Field Rules
- **Pickup**: Address is **required**. Contact name, contact phone, rider note, and photo attachment are **optional**. Include `[ 🎯 Use current location ]` GPS button.
- **Drop-off**: Recipient name is **optional**. Recipient phone number is **required** (8–15 digits). Drop-off address is **required**. Rider note and photo attachment are **optional**.
- **Map Pinning**: Use Google Maps exclusively (never Leaflet/OpenStreetMap). Provide a **single** map trigger button per address field (never duplicate buttons).
- **COD**: Optional toggle. When enabled, amount must be positive. **Never add COD to the delivery fee total**.
- **Multi-Drop**: Stored as `dropoffs: DropoffStop[]`. Keep `dropoffs[0]` synchronized with `recipient` and `dropoff` for backwards compatibility.

### 3. Space-Efficient UI
- Keep optional sections compact. Combine related simple fields (e.g., parcel info + COD toggle).
- Do not use `bg-gradient`. Use Tailwind `bg-linear` only if genuinely needed.
- Brand colors (cloned from shop.wingmall.com): Primary Wing Gold (`primary` / `primary-500`), Wing Royal Blue (`secondary-600` / `brand-600`), Wing Lime (`brand-lime`), and Success Green (`success-600` / `wingmall-success`). Use theme utility classes exclusively.

### 4. Verification Commands
Always verify before completing:
```bash
yarn tsc --noEmit    # Must have 0 errors
yarn test            # Must pass all unit tests
yarn build           # Must produce successful production build
```

