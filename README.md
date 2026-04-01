# SZ Metal Admin Panel

A full-featured admin panel for managing metal products, manufacturing requests, client accounts, and orders. Built with **Next.js 16**, **Supabase**, **MUI**, **Tailwind CSS**, and **TypeScript**.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | App Router with SSR + RSC, Turbopack dev server |
| [React 19](https://react.dev) | UI library |
| [TypeScript 5.9](https://www.typescriptlang.org) | Type safety |
| [Supabase](https://supabase.com) | Auth, PostgreSQL database, storage, and API |
| [MUI v7](https://mui.com) | Material Design components |
| [MUI X DataGrid](https://mui.com/x/react-data-grid/) | Advanced data tables |
| [MUI X Charts](https://mui.com/x/react-charts/) | Line, area, pie, and bar charts |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first CSS |
| [React Hook Form](https://react-hook-form.com) | Form state management |
| [Yup](https://github.com/jquense/yup) | Schema-based form validation |
| [TanStack React Query](https://tanstack.com/query) | Server state management |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [react-pdf](https://github.com/wojtekmaj/react-pdf) | PDF viewing |
| [pdf-lib](https://pdf-lib.js.org) | PDF generation |
| [Playwright](https://playwright.dev) | E2E testing |

---

## Features

- **Role-Based Access Control** — Admin, Manager, and User roles with granular page-level permissions
- **User Status Management** — Active, Inactive, and Banned states with specific access rules
- **Product Catalog** — Full CRUD with filtering, categorization, variants, and file uploads (images & PDFs)
- **3-Step Request Workflow** — Guided system request creation with drafts, material calculations, and PDF export
- **Orders Inbox** — Order notifications with read/unread tracking
- **Client Management** — Admin tools for managing user roles and statuses
- **Analytics Dashboards** — Product, request, and user trend charts with stat cards
- **Dark / Light Theme** — System preference detection with persistent cookie storage
- **Live Rates Ticker** — Real-time TCMB currency rates on the dashboard
- **Secure File Uploads** — Signed URLs for product files and avatar uploads
- **Rate-Limited Auth** — Login attempt throttling per IP address
- **Responsive Design** — Mobile-first layout with collapsible sidebar

---

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/              # Public auth pages (login, register, forgot/reset password)
│   ├── (admin)/             # Protected pages (requires authentication)
│   │   ├── account/         # User profile management
│   │   ├── dashboard/       # Admin-only analytics dashboard
│   │   ├── products/        # Product catalog (list, create, detail, edit)
│   │   ├── products_analytics/ # Product inventory analytics
│   │   ├── create_request/  # Multi-step request creation wizard
│   │   ├── requests/        # Request list and detail views
│   │   ├── clients/         # User management (Admin/Manager)
│   │   └── orders/          # Order inbox
│   └── api/                 # API routes (auth, products, requests, orders, etc.)
├── features/                # Feature modules (components, hooks, services, types)
├── components/              # Shared UI components (charts, cards, dialogs, pagination)
├── lib/                     # Supabase clients, auth guards, hooks
├── theme/                   # MUI theme config, dark/light palettes, component overrides
├── types/                   # Generated Supabase types
├── utils/                   # Helpers (formatting, formulas, role utilities)
└── constants/               # Navigation links, layout dimensions, validation schemas
supabase/                    # Supabase config & migrations
scripts/                     # Type generation & PDF worker scripts
e2e/                         # Playwright tests
```

---

## Role Permissions

| Page | Admin | Manager | User |
|---|:---:|:---:|:---:|
| Account | Yes | Yes | Yes |
| Products | Yes | Yes | Yes |
| Create Request | Yes | Yes | Yes* |
| Orders | Yes | Yes | Yes |
| Requests | Yes | Yes | — |
| Clients | Yes | Yes | — |
| Products Analytics | Yes | Yes | — |
| Dashboard | Yes | — | — |

\* Inactive users cannot access the Create Request flow.

---

## Getting Started

### Prerequisites

- Node.js >= 20.19 (< 23)
- npm
- A [Supabase](https://supabase.com) project (or local Supabase via CLI)

### Installation

```bash
git clone <repo-url>
cd szmetal-admin-panel
npm ci
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Development

```bash
npm run dev
```

This runs the pre-dev script automatically, which:
1. Copies the PDF worker to `/public`
2. Generates Supabase TypeScript types
3. Starts the Next.js dev server with Turbopack

### Build

```bash
npm run build
```

### Lint & Type Check

```bash
npm run lint
npm run typecheck
```

### E2E Tests

```bash
npx playwright test
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint on `src/` |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run types:supabase` | Regenerate Supabase types |
| `npm run ci` | Full CI pipeline (install, lint, typecheck, build) |

---

## Authentication Flow

```
/login → POST /api/login → Supabase Auth
  → Verify email confirmed
  → Auto-create profile if missing (default: User, Inactive)
  → Check ban status
  → Set session cookies
  → Redirect to /account
```

Each protected page uses server-side guards (`requirePageAccess`) that verify the user's role and status before rendering.

---

## License

Private project.
