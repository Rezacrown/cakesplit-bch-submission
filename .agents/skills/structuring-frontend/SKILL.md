---
name: structuring-frontend
description: "Architect, organize, and refactor frontend codebases using a 5-layer downward modular pattern. Separates dumb UI presentation (_components), reactive orchestrator hooks (_hooks), pure domain logic (utils/), application services (services/), 3rd-party vendor adapters (integrations/), and configured package instances (lib/), with an upfront alignment gate."
---

# Structuring Frontend Architecture

Use this skill when designing, building, or refactoring features in frontend applications (React, Next.js, Vite, Vue, etc.). It establishes a clear, scalable structure that keeps codebases clean for human developers and context-efficient for AI agents.

---

## 1. Architectural Philosophy & The 5-Layer Downward Flow

A scalable, maintainable frontend codebase enforces **clear boundaries and single responsibilities**. Code flows strictly **downward**—higher layers may consume lower layers, but lower layers never depend on higher layers.

```text
┌──────────────────────────────────────────────────────────────┐
│  1. PRESENTATION LAYER (_components/)                        │  <-- "Dumb" UI View
│     Visual layouts, HTML markup, Tailwind/CSS, emit events   │
└──────────────────────────────┬───────────────────────────────┘
                               │ consumes prepared ViewModels
┌──────────────────────────────▼───────────────────────────────┐
│  2. ORCHESTRATION LAYER (_hooks/)                            │  <-- The Reactive Bridge
│     Glues reactivity (state, stores), calls services & utils │
└──────────────┬───────────────────────────────┬───────────────┘
               │ calls pure calculations       │ calls app operations
┌──────────────▼───────────────┐ ┌─────────────▼───────────────┐
│ 3. PURE LOGIC (utils/)       │ │ 4. APPLICATION SERVICES     │  <-- App Workflows
│    (Calculations, transforms,│ │    (services/)              │
│    math, schema validators)  │ │    Client & Server flows    │
└──────────────────────────────┘ └─────────────┬───────────────┘
                                               │ consumes
               ┌───────────────────────────────┴───────────────┐
               ▼                                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│ 5A. 3RD-PARTY INTEGRATIONS   │ │ 5B. PACKAGE INSTANCES (lib/)│  <-- Foundation
│     (integrations/)          │ │     Configured SDKs, base   │
│     Vendor adapters & APIs   │ │     HTTP clients, libraries │
└──────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Directory Taxonomy & Responsibilities

### A. `lib/` — Package & SDK Instances
* **Purpose**: The initialization ground for third-party libraries and packages.
* **What goes here**: Base configured clients, SDK instances, and package setups (e.g., `lib/axios.ts`, `lib/queryClient.ts`, `lib/dayjs.ts`, `lib/authClient.ts`).
* **Rule**: Put configurations, interceptors, timeouts, and base setup here. Do not write feature-specific business workflows in `lib/`.

### B. `utils/` — Pure Logic & Deterministic Functions
* **Purpose**: Pure, deterministic helpers that perform computation without side effects.
* **What goes here**: Mathematical calculations, date formatters, currency formatters, array/object data transformers, string sanitizers, and validation schemas (e.g., `utils/currency.ts`, `utils/formatters.ts`, `utils/validation.ts`).
* **Rule**: 100% pure functions. No React hooks, no DOM manipulation, no network calls. Given the same inputs, a utility must always return the exact same output.

### C. `integrations/` — Third-Party External Boundaries
* **Purpose**: Encapsulates external vendors, third-party platforms, and external APIs (replaces the ambiguous term *"capabilities"*).
* **What goes here**: Dedicated adapters for external providers—payment gateways, email services, cloud storage, external identity/OAuth, analytics, or maps (e.g., `integrations/payment/`, `integrations/storage/`, `integrations/analytics/`).
* **Rule**: Isolate third-party vendor SDKs behind generic application interfaces. If your project switches vendors (e.g., from one storage provider to another), only the files inside `integrations/` change; your services, hooks, and UI remain untouched.

### D. `services/` — Application Operations & Workflows
* **Purpose**: Your application's internal data operations, business workflows, and API consumption.
* **What goes here**: Feature-level data fetching, mutation operations, caching, and payload preparation (e.g., `services/userService.ts`, `services/catalogService.ts`).
* **Server vs Client Separation**:
  * In fullstack or hybrid frameworks (e.g., Next.js, Remix, SSR), divide into:
    * `services/client/`: Operations that execute in the browser (client-side fetchers, browser storage synchronization).
    * `services/server/`: Operations that execute on the server (Server Actions, direct database queries, protected API routes).
  * In purely client-side SPAs (Vite, CRA), a unified `services/` folder handles all API communication.
* **Rule**: Services consume initialized instances from `lib/` and external adapters from `integrations/`. They do not contain React state or JSX.

### E. `modules/` — Feature-Driven Domain Encapsulation
* **Purpose**: Feature-specific domain folders grouped by business boundaries (`modules/<domain>/<subdomain>/`).
* **Structure inside each module**:
  * `_components/`: Dumb presentational UI components (`.tsx`). Only render props and emit event callbacks.
  * `_hooks/`: Reactive orchestrators / ViewModels (`.ts`). Bridges React state (`useState`, Zustand, React Query) with `services/` and `utils/`.
  * `_utils/`: Local pure functions specific to this module.
  * `_services/`: Local service endpoints specific only to this module.
  * `constants.ts`: Module-specific constants, table headers, default form values.
  * `index.ts`: Barrel export defining the module's public contract.

### F. `components/` — Shared UI Primitives & Shell Layouts
* **`components/ui/`**: Cross-cutting design system primitives (Button, Input, Dialog, Table, Badge).
* **`components/layout/`**: Application shell layouts (Navbar, Sidebar, Footer, PageWrapper).

---

## 3. End-to-End Interaction Blueprint

Here is an example demonstrating how data flows across the layers during a typical user action:

```typescript
// ============================================================================
// LAYER 5B: lib/httpClient.ts (Package Instance)
// ============================================================================
import axios from "axios"

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

// ============================================================================
// LAYER 5A: integrations/storage/s3Adapter.ts (3rd-Party Integration)
// ============================================================================
export const storageIntegration = {
  async uploadFile(file: File): Promise<{ fileUrl: string }> {
    // Encapsulates vendor-specific upload logic
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("https://vendor-storage.example.com/upload", {
      method: "POST",
      body: formData,
    })
    return res.json()
  },
}

// ============================================================================
// LAYER 4: services/catalogService.ts (Application Operations)
// ============================================================================
import { httpClient } from "@/lib/httpClient"
import type { RawProductDTO, CreateProductPayload } from "@/types"

export const catalogService = {
  async getProducts(): Promise<RawProductDTO[]> {
    const res = await httpClient.get<RawProductDTO[]>("/products")
    return res.data
  },
  async createProduct(payload: CreateProductPayload): Promise<void> {
    await httpClient.post("/products", payload)
  },
}

// ============================================================================
// LAYER 3: utils/pricing.ts (Pure Domain Logic)
// ============================================================================
export function calculateDiscountedPrice(basePrice: number, discountPercentage: number): number {
  if (discountPercentage <= 0) return basePrice
  const discounted = basePrice - (basePrice * (discountPercentage / 100))
  return Math.round(discounted * 100) / 100
}

// ============================================================================
// LAYER 2: modules/catalog/_hooks/useCatalogList.ts (Reactive Orchestrator)
// ============================================================================
import { useState, useEffect } from "react"
import { catalogService } from "@/services/catalogService"
import { calculateDiscountedPrice } from "@/utils/pricing"
import type { CatalogItemViewModel } from "../types"

export function useCatalogList() {
  const [items, setItems] = useState<CatalogItemViewModel[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadCatalog = async () => {
    setIsLoading(true)
    try {
      const rawProducts = await catalogService.getProducts()
      // Transform raw data using pure domain utility into a ViewModel
      const viewModels: CatalogItemViewModel[] = rawProducts.map((p) => ({
        id: p.id,
        name: p.name,
        finalPrice: calculateDiscountedPrice(p.basePrice, p.discount),
        imageUrl: p.mediaUrl,
      }))
      setItems(viewModels)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCatalog()
  }, [])

  return {
    items,
    isLoading,
    refresh: loadCatalog,
  }
}

// ============================================================================
// LAYER 1: modules/catalog/_components/CatalogTable.tsx (Dumb UI)
// ============================================================================
import type { CatalogItemViewModel } from "../types"

interface CatalogTableProps {
  items: CatalogItemViewModel[]
  isLoading: boolean
  onRefresh: () => void
}

export function CatalogTable({ items, isLoading, onRefresh }: CatalogTableProps) {
  if (isLoading) return <div className="p-4 text-center">Loading catalog...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Product Catalog</h2>
        <button onClick={onRefresh} className="btn-secondary">Refresh</button>
      </div>
      <table className="w-full border-collapse">
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td><img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded" /></td>
              <td className="font-medium">{item.name}</td>
              <td className="text-right">${item.finalPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 4. Full Monorepo Directory Blueprint

```text
src/
├── components/                 # Global UI & Layouts
│   ├── ui/                     # Design system primitives (Button, Dialog, Input, Table)
│   └── layout/                 # Shell wrappers (Navbar, Sidebar, PageContainer)
│
├── lib/                        # Configured third-party package & SDK instances
│   ├── httpClient.ts           # Configured Axios / Fetch client with interceptors
│   ├── queryClient.ts          # Configured TanStack Query client
│   └── authClient.ts           # Configured authentication SDK instance
│
├── utils/                      # Pure domain functions & deterministic helpers
│   ├── currency.ts             # Price & currency formatting
│   ├── date.ts                 # Date/time formatters
│   └── validation.ts           # Reusable Zod schemas
│
├── integrations/               # External vendor & third-party service adapters
│   ├── payment/                # Payment gateway adapter (e.g., Stripe, LemonSqueezy)
│   ├── storage/                # Cloud storage adapter (e.g., S3, Cloudinary, IPFS)
│   └── analytics/              # Telemetry adapter (e.g., PostHog, Mixpanel)
│
├── services/                   # Application operations & data orchestration
│   ├── client/                 # Browser-side fetchers and client workflows
│   │   ├── catalogService.ts
│   │   └── userService.ts
│   └── server/                 # Server-side operations (Next.js Server Actions, API handlers)
│       └── dbService.ts
│
├── modules/                    # Feature domain modules
│   └── <feature-domain>/       # e.g., catalog, checkout, accounts
│       ├── _components/        # Dumb presentational UI (.tsx)
│       ├── _hooks/             # Reactive orchestrator hooks (.ts)
│       ├── _utils/             # Feature-specific pure calculations (if private)
│       ├── _services/          # Feature-specific endpoints (if private)
│       ├── constants.ts        # Module configuration, dropdown values, options
│       └── index.ts            # Public API contract for this module
│
├── store/                      # Global client state (Zustand, Jotai, Redux)
└── types/                      # Global TypeScript definitions & DTOs
```

---

## 5. Practical File Size & Token Budget (< 250 Lines)

* **Target Bound**: Aim for an upper limit of **~250 lines per file**.
* When a component grows beyond 250 lines, decompose it:
  * Extract sub-modals into separate files inside `_components/`.
  * Extract complex table row layouts or wizard steps into dedicated sub-components.
* When a hook grows beyond 250 lines, split sub-concerns (e.g., separate form state validation from list fetching).
* Decomposing files into clean, bite-sized units keeps human code reviews straightforward and eliminates token bloat and hallucination for AI agents.

---

## 6. Execution Workflow: The Alignment Gate

Whenever tasked with building, restructuring, or refactoring frontend code, follow this sequence:

### Step 1: Proposal & Directory Blueprint
Analyze the requested feature and produce a concise tree diagram:
* Planned module name and any sub-modules.
* Proposed files in `_components/`, `_hooks/`, and relevant `services/` or `utils/`.
* 1-line summary of each file's responsibility.

### Step 2: Confirmation Gate (DO NOT TOUCH CODE YET)
* **Pause**: Present the proposed structure to the developer and wait for approval.
* Incorporate any adjustments the developer requests regarding naming, grouping, or placement before writing or modifying files.

### Step 3: Progressive Implementation
Once approved, build downward from foundation to UI:
1. Initialize package instances in `lib/` (if adding new dependencies).
2. Create vendor adapters in `integrations/` (if integrating external providers).
3. Implement application operations in `services/`.
4. Write pure functions/validators in `utils/`.
5. Implement the reactive orchestrator hook in `_hooks/`.
6. Implement the presentational component in `_components/`.
7. Export public entry points via `index.ts` and connect to the page router.

### Step 4: Verification
Run static validation to ensure everything builds cleanly:
```bash
pnpm typecheck
pnpm lint
```
Verify that no newly created file exceeds the ~250-line guideline.
