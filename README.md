# Express Seller — Seller Delivery Management Platform

A high-performance, production-ready Express Seller Web Application engineered to make booking, managing, and tracking multiple daily deliveries fast, seamless, and effortless for online merchants (Facebook Live sellers, boutique shops, e-commerce stores).

---

## 1. Technology Stack

- **Framework**: Next.js 15 App Router (React 19, TypeScript in strict mode)
- **Architecture**: Backend-for-Frontend (BFF) with React Server Components & Route Handlers
- **Styling**: Tailwind CSS (clean SaaS aesthetic, subtle borders, soft shadows, no `bg-gradient`)
- **Forms & Validation**: React Hook Form, Zod
- **Icons**: Lucide React
- **Mapping & Geocoding**: Google Maps (with route preview, zone quick-select, coordinate parser & direct pin links)
- **Session Security**: JWE (AES-256-GCM) encrypted HttpOnly cookies powered by `jose`
- **Testing**: Vitest
- **Package Management**: Yarn managed via Corepack and NVM
- **Target Deployment**: Vercel

---

## 2. Development Environment & Setup

This repository uses **Node.js 22 LTS** specified in `.nvmrc` and Yarn via Corepack.

### Prerequisites

Make sure [NVM](https://github.com/nvm-sh/nvm) is installed on your workstation.

### Installation Steps

```bash
# 1. Switch to the active Node LTS version
nvm install
nvm use

# 2. Enable Corepack and install dependencies
corepack enable
yarn install

# 3. Start local development server
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Architecture & Security Model

The application strictly implements a **Backend-for-Frontend (BFF)** pattern:

```
Browser Client (React Server & Client Components)
      │
      │  Strictly internal BFF endpoints (/api/*)
      ▼
Next.js Route Handlers (BFF Backend)
      │
      ├── Authentication Service
      │     └── Encrypted HttpOnly Cookie Session (AES-256-GCM / Jose)
      │
      ├── Consumer API Client (server-only)
      │     └── Phone + PIN auth, token exchange, user profile
      │
      └── Express API Client (server-only)
            ├── Fee calculation (/express/fee)
            ├── Saved locations (/express/saved-locations)
            ├── Recipient lookup (/express/recipients)
            └── Delivery bookings (/express/bookings with idempotency)
                  │
                  ▼
       Upstream APIs (Real or Dev Fallback Adapter)
```

### Key Security Principles

1. **Zero Browser Token Leaks**: Access tokens and upstream credentials NEVER reach client JavaScript or browser storage (`localStorage` / `sessionStorage`).
2. **Encrypted HttpOnly Session**: All session tokens are encrypted on the server with AES-256-GCM authenticated encryption into an HttpOnly, SameSite cookie (`express_seller_session`).
3. **Privileged Boundary Isolation**: All upstream API clients enforce `import 'server-only'` to prevent accidental inclusion in client bundles.
4. **Server-Side Price Validation**: Delivery fees and charges are recalculated and validated server-side to prevent tampering.
5. **Idempotency Protection**: Booking submissions include idempotency keys (`x-idempotency-key`) to prevent duplicate dispatches.

---

## 4. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `CONSUMER_API_BASE_URL` | Upstream Consumer Identity Base URL | `https://stage-api.wingbank.com/identity/v1` |
| `CONSUMER_CLIENT_ID` | Consumer Client ID | `express-seller-web` |
| `EXPRESS_API_BASE_URL` | Upstream Express Delivery Base URL | `https://stage-api.wingbank.com/delivery/v1` |
| `SESSION_SECRET` | 32+ character secret for AES-256-GCM JWE encryption | Must be kept secret in production |
| `MOCK_UPSTREAM_API` | Fallback adapter mode for offline/local development | `true` (enables seamless local dev without stage VPN) |
| `NEXT_PUBLIC_MAP_PROVIDER` | Map engine provider | `osm` |

---

## 5. High-Speed Seller Booking Workflow

Designed specifically for online merchants booking high volumes of parcels every day:

1. **Step 1: Pickup Location**: Automatically selects the merchant's default warehouse/branch. Supports switching to other saved branches or pinning a new address with GPS or search.
2. **Step 2: Recipient Information**: Search recipient by phone number with instant autofill suggestions. Supports "Book on behalf" for partner stores.
3. **Step 3: Drop-off Location**: Interactive Google Maps preview with coordinate verification, zone quick-select, Google Maps link parsing, and address lookups.
4. **Step 4: Parcel Details**: Seller order reference (e.g. Facebook Live order #), description, item quantity, and driver instructions.
5. **Step 5: Cash on Delivery (COD)**: Toggle COD collection amount. Explains that COD is money collected for the merchant, not an additional delivery expense.
6. **Confirmation & Review**: Concise review screen with inline edit actions for each step and duplicate-submission prevention.
7. **Success & One-Click Customer Sharing**: Instant tracking number generation, one-click copy of tracking link, and pre-formatted customer SMS/chat text template.
8. **Repeat Booking ("Book Again")**: From Booking History or Booking Details, clicking "Book Again" clones the recipient, dropoff, and order draft for instant re-booking.

---

## 6. Atomic Design Component Architecture

All files and directories use **strict kebab-case** naming:

- **Atoms (`src/components/atoms/`)**: `button.tsx`, `input.tsx`, `label.tsx`, `badge.tsx`, `avatar.tsx`, `spinner.tsx`, `skeleton.tsx`, `divider.tsx`, `checkbox.tsx`, `switch.tsx`, `card.tsx`, `tooltip.tsx`.
- **Molecules (`src/components/molecules/`)**: `form-field.tsx`, `phone-input.tsx`, `search-input.tsx`, `location-search.tsx`, `address-card.tsx`, `recipient-card.tsx`, `price-row.tsx`, `status-badge.tsx`, `empty-state.tsx`, `error-message.tsx`, `booking-action-bar.tsx`.
- **Organisms (`src/components/organisms/`)**: `app-header.tsx`, `app-sidebar.tsx`, `dashboard-stats.tsx`, `location-picker.tsx`, `dropoff-picker.tsx`, `recipient-form.tsx`, `parcel-information.tsx`, `cod-section.tsx`, `booking-summary.tsx`, `booking-confirmation.tsx`, `booking-success.tsx`, `booking-history-table.tsx`, `delivery-map.tsx`, `booking-form.tsx`.
- **Templates (`src/components/templates/`)**: `auth-layout.tsx`, `dashboard-layout.tsx`, `booking-layout.tsx`.
- **Pages (`src/app/`)**: Next.js App Router pages for `/login`, `/verify-pin`, `/dashboard`, `/bookings/new`, `/bookings`, `/bookings/[booking-id]`, `/recipients`.

---

## 7. Testing & Build

```bash
# Run automated test suite (schemas, pricing math, encryption, API adapters)
yarn test

# Create optimized production build
yarn build

# Start production server
yarn start
```

