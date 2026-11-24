# Field Sales Management System

An enterprise, multi-dealership **Field Sales Management System** engineered with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Redux Toolkit**.

Designed as an operational, high-density **Modular Monolith** inspired by the visual usability and dispatch paradigms of **Shipday**.

---

## 📑 Table of Contents
1. [Core Architectural Principles](#-core-architectural-principles)
2. [Technology Stack](#-technology-stack)
3. [Folder Architecture](#-folder-architecture)
4. [Design System & Visual Tokens (Shipday Inspired)](#-design-system--visual-tokens-shipday-inspired)
5. [State Management Boundaries](#-state-management-boundaries)
6. [Reusable UI Component Library](#-reusable-ui-component-library)
7. [Environment Variables](#-environment-variables)
8. [Development & Verification Commands](#-development--verification-commands)
9. [SOLID Principles Alignment](#-solid-principles-alignment)
10. [16-Phase Master Development Roadmap](#-16-phase-master-development-roadmap)

---

## 🚀 Core Architectural Principles

- **Modular Monolith**: Clean separation between presentation (`app/`), shared layout/ui components (`components/`), feature modules (`features/`), cross-cutting infrastructure (`lib/`), and client state (`store/`).
- **Server Components by Default**: Zero unnecessary client bundle overhead; interactive controls are isolated using targeted `"use client"` wrappers.
- **Shipday-Inspired Operational Density**: Purpose-built for high-volume dispatch operations with split-view layouts, high-density tables (40px rows), clear status indicators, and slide-over order milestone drawers.
- **Local-First PWA Readiness**: Architected with clear state boundaries to prepare for **RxDB + IndexedDB** offline synchronization in Phase 11.
- **Multi-Tenant Isolation**: Designed to support Mother Company executive governance alongside strict, isolated Dealership workspaces.

---

## 🛠 Technology Stack

| Tier | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js App Router | `^16.4.6` | Server Components, routing, Webpack production pipeline |
| **UI Library** | React & React DOM | `^19.2.3` | Modern React 19 hooks and layout composition |
| **Language** | TypeScript (Strict Mode) | `^5.9.3` | Full type safety with zero implicit `any` |
| **Styling** | Tailwind CSS v4 & PostCSS | `^4.1.16` | Dynamic `@theme` CSS variables, zero runtime overhead |
| **Primitives** | Radix UI | Latest | Accessible headless dialogs, dropdowns, tabs, avatars |
| **Icons** | Lucide React | `^0.473.0` | High-clarity operational iconography |
| **Client State** | Redux Toolkit | `^2.6.1` | Lightweight client UI state (sidebar collapse, mobile drawer) |
| **Unit Testing** | Vitest + Testing Library | `^3.0.5` | Fast DOM component and utility tests in JSDOM |
| **E2E Testing** | Playwright | `^1.50.1` | Automated browser smoke tests on Desktop and Mobile viewports |

---

## 📂 Folder Architecture

```text
field-sales-management-system/
├── e2e/                             # Playwright end-to-end smoke tests
│   └── dashboard-smoke.spec.ts      # Desktop (1440px) & Mobile (390px) test suites
├── public/                          # Static assets and icons
├── src/
│   ├── app/                         # Next.js 16 App Router
│   │   ├── (dashboard)/             # Protected admin shell routes
│   │   │   ├── layout.tsx           # Shell container with Sidebar + TopNav
│   │   │   ├── dashboard/page.tsx   # Operational overview & KPI cards
│   │   │   ├── orders/page.tsx      # Orders module placeholder (Phase 8)
│   │   │   ├── pre-orders/page.tsx   # Pre-orders placeholder
│   │   │   ├── custom-orders/page.tsx # Custom orders placeholder
│   │   │   ├── field-operations/page.tsx # Dispatch map placeholder (Phase 11)
│   │   │   ├── dealerships/page.tsx # Dealership management placeholder
│   │   │   ├── sales-reps/page.tsx  # SR fleet roster placeholder
│   │   │   ├── outlets/page.tsx     # Retail outlets directory placeholder
│   │   │   ├── products/page.tsx    # Product catalog placeholder
│   │   │   ├── analytics/page.tsx   # Performance reports placeholder
│   │   │   ├── notifications/page.tsx # Operational alerts placeholder
│   │   │   └── settings/page.tsx    # Governance settings placeholder
│   │   ├── globals.css              # Tailwind v4 @theme design tokens
│   │   ├── layout.tsx               # Root HTML shell & Redux Provider
│   │   ├── page.tsx                 # Root redirect to /dashboard
│   │   ├── loading.tsx              # Shimmer skeleton loader
│   │   ├── not-found.tsx            # Clean 404 handler
│   │   ├── error.tsx                # Client error boundary
│   │   └── global-error.tsx         # Root layout crash handler
│   ├── components/
│   │   ├── layout/                  # Desktop Sidebar, Mobile Drawer, TopNav, AdminShell
│   │   ├── shared/                  # KPI Card, StatusBadge, OrderDetailDrawer, OperationalTable
│   │   └── ui/                      # Button, Input, Card, Table, Badge, Dialog, Dropdown, etc.
│   ├── features/
│   │   └── dashboard/               # Dashboard feature module
│   │       └── components/          # KPIGrid, DealershipTable, FieldActivities, StatusDistribution
│   ├── lib/
│   │   ├── config/site.ts           # App branding & site constants
│   │   ├── constants/               # Navigation items & realistic mock datasets
│   │   └── utils.ts                 # Currency (BDT ৳), number, and date formatters
│   ├── store/                       # Redux Toolkit store (UI state only)
│   │   ├── index.ts                 # Root store configuration
│   │   ├── ui-slice.ts              # Sidebar collapse & active filters slice
│   │   ├── hooks.ts                 # Typed useDispatch & useSelector hooks
│   │   └── provider.tsx             # Client Provider wrapper
│   ├── test/                        # Vitest test setup and unit suites
│   │   ├── setup.ts                 # @testing-library/jest-dom setup
│   │   ├── utils.test.ts            # Utility function tests
│   │   ├── ui-slice.test.ts         # Redux reducer tests
│   │   └── components.test.tsx      # UI & Badge component rendering tests
│   └── types/                       # Core TypeScript domain entities & order models
├── eslint.config.mjs                # ESLint 9 Flat Config with @typescript-eslint
├── next.config.ts                   # Next.js configuration with Webpack build optimization
├── playwright.config.ts             # Playwright multi-device configuration
├── postcss.config.mjs               # PostCSS with @tailwindcss/postcss
├── tsconfig.json                    # TypeScript strict mode with @/* path alias
└── vitest.config.ts                 # Vitest test runner configuration
```

---

## 🎨 Design System & Visual Tokens (Shipday Inspired)

The design system is defined using CSS variables in `src/app/globals.css` using Tailwind CSS v4 `@theme`:

### 1. Palette
- **Canvas Background**: `#f8fafc` (Slate 50 — clean, low-glare operational surface)
- **Cards & Drawers**: `#ffffff` (Pure White with subtle `border-slate-200`)
- **Primary Brand**: `#2563eb` (Royal Blue 600) & `#1d4ed8` (Blue 700 hover)
- **Sidebar Background**: `#0f172a` (Slate 900 — deep contrast dark sidebar)

### 2. Semantic Operational Status Tokens
- **Draft / New**: Slate (`bg-slate-100 text-slate-700`)
- **Pending Review**: Amber (`bg-amber-50 text-amber-700 border-amber-200`)
- **Assigned to SR**: Sky (`bg-sky-50 text-sky-700 border-sky-200`)
- **En Route**: Indigo (`bg-indigo-50 text-indigo-700 border-indigo-200`)
- **Delivered**: Emerald (`bg-emerald-50 text-emerald-700 border-emerald-200`)
- **Cancelled**: Red (`bg-red-50 text-red-700 border-red-200`)
- **Offline Queued**: Cyan (`bg-cyan-50 text-cyan-700 border-cyan-200`)

---

## ⚡ State Management Boundaries

- **Client UI State Only in Redux**: `src/store/ui-slice.ts` strictly manages temporary UI states:
  - `sidebarCollapsed`: Toggle desktop left rail between 256px and 72px.
  - `mobileMenuOpen`: Mobile slide-out drawer open/close.
  - `selectedDealership`: Active dealership filter selector.
  - `activeOrderDrawerId`: Open slide-over order details drawer.
- **No Redux as Database**: Business domain data is NOT duplicated in Redux.
- **Future RxDB Integration**: Prepared for client-side local database in Phase 11 without refactoring the UI.

---

## 🧪 Development & Verification Commands

```bash
# Start development server
npm run dev

# Run TypeScript strict typecheck (zero errors)
npm run typecheck

# Run ESLint check
npm run lint

# Run Vitest unit & component tests
npm run test

# Run Next.js production build
npm run build

# Run Playwright e2e smoke tests (Desktop & Mobile)
npm run test:e2e
```

---

## 🏛 SOLID Principles Alignment

1. **Single Responsibility Principle (SRP)**:
   - UI components (`Button`, `Badge`, `Card`) only handle view presentation.
   - `formatCurrency` and `formatNumber` reside in dedicated utility modules.
   - Redux `uiSlice` only handles UI navigation toggles.
2. **Open/Closed Principle (OCP)**:
   - `StatusBadge` uses a variant pattern easily extendable with new business statuses without rewriting component callers.
3. **Liskov Substitution Principle (LSP)**:
   - Substituted components (`Button` with `asChild`, custom badges) inherit standard HTML attributes transparently.
4. **Interface Segregation Principle (ISP)**:
   - Discrete interfaces in `src/types/index.ts` (`Order`, `OrderItem`, `KPICardData`, `DealershipPerformance`).
5. **Dependency Inversion Principle (DIP)**:
   - Feature views consume high-level abstractions and typed hooks (`useAppDispatch`, `useAppSelector`).

---

## 🗺 16-Phase Master Development Roadmap

- **Phase 0**: Repository Audit & Architecture Plan *(Completed)*
- **Phase 1**: Project Foundation + Design System + Admin Shell *(Completed)*
- **Phase 2**: Database Modeling, Multi-Tenant Isolation & Mongoose Schemas (10M+ Scale)
- **Phase 3**: Server-Side Authentication, RBAC & Security Infrastructure
- **Phase 4**: ERP Adapter Engine & Mock ERP Provider Implementation
- **Phase 5**: Territory, Dealership & Route Planning Module
- **Phase 6**: Retailer / Customer Directory & CRM Module
- **Phase 7**: Product Catalog & Multi-Tier Pricing Engine
- **Phase 8**: Sales Order Management & Processing Engine
- **Phase 9**: Field Sales Rep (SR) Mobile-First PWA & Offline Engine
- **Phase 10**: Automatic Synchronization, Queue & Conflict Reconciliation Engine
- **Phase 11**: Real-Time Map Dispatch & Live Tracking Operations (Shipday Style) + RxDB Local-First
- **Phase 12**: Dealership Inventory & Stock Transfer Reconciliation
- **Phase 13**: Payments, Collections & Credit Limit Management
- **Phase 14**: Analytics, Executive KPI Dashboards & Performance Reporting
- **Phase 15**: Mother Company Integration & End-to-End Stress/Scale Testing
- **Phase 16**: Production Hardening, Security Audit & Deployment Preparation
