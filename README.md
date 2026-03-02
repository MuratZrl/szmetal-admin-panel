# SZMetal Admin Panel

A modern admin dashboard for managing products, clients, and analytics. Built with Next.js 16, MUI, and Supabase.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| Language | TypeScript 5.9 (strict mode) |
| UI | MUI 7 + Tailwind CSS 4 |
| Charts | MUI X-Charts (Line, Bar, Pie, Donut, Gauge) |
| Data Tables | MUI X-DataGrid |
| Auth & DB | Supabase (PostgreSQL + Row Level Security) |
| Forms | React Hook Form + Yup |
| Data Fetching | TanStack React Query |
| Animations | Framer Motion |
| PDF | react-pdf + pdf-lib |
| Theming | Light / Dark mode with cookie persistence |

## Features

- **Dashboard** --- Analytics overview with date range filters, metal price ticker, activity feed, and multiple chart types
- **Products** --- Full product catalog with category hierarchy, variant filtering, media uploads (images & PDFs), and CRUD operations
- **Product Analytics** --- Performance metrics, trend analysis, and category breakdowns
- **Clients** --- User management with status/role controls, trend charts, and data tables
- **Account** --- Profile editing, avatar upload, and password management

## Authentication & Authorization

**Roles:** Admin, Manager, User

| Route | Admin | Manager | User |
|-------|-------|---------|------|
| `/dashboard` | Yes | --- | --- |
| `/clients` | Yes | Yes | --- |
| `/products` | Yes | Yes | Yes |
| `/products_analytics` | Yes | Yes | --- |
| `/account` | Yes | Yes | Yes |

Additional security layers:
- IP-based access restriction in production (all routes)
- Row Level Security on all Supabase tables
- Server-side session validation
- Security headers (CSP, HSTS, X-Frame-Options)

## Getting Started

### Prerequisites

- Node.js >= 20.19, < 23
- A Supabase project with the required tables and RLS policies

### Installation

```bash
git clone https://github.com/MuratZrl/szmetal-admin-panel.git
cd szmetal-admin-panel
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

NEXT_PUBLIC_SUPABASE_AVATARS_BUCKET=avatars
NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET=product-media

METALS_API_KEY=<your-metals-api-key>

# Production only - comma-separated allowed IPs
ALLOWED_IPS=
```

### Development

```bash
npm run dev
```

### Build & Production

```bash
npm run build
npm run start
```

### Other Scripts

| Script | Purpose |
|--------|---------|
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run ci` | Lint + typecheck + build |
| `npm run types:supabase` | Generate Supabase types |

## Project Structure

```
src/
├── app/
│   ├── (admin)/              # Protected admin routes with sidebar layout
│   ├── (auth)/               # Login, register, password recovery
│   └── api/                  # API route handlers
├── components/
│   ├── layout/               # Breadcrumb, shell components
│   └── ui/                   # Cards, charts, dialogs, pagination, motion
├── features/
│   ├── account/              # Profile & settings
│   ├── auth/                 # Auth guards & redirects
│   ├── clients/              # Client management
│   ├── dashboard/            # Dashboard analytics
│   ├── products/             # Product catalog & CRUD
│   ├── products_analytics/   # Product analytics
│   └── sidebar/              # Navigation sidebar
├── lib/supabase/             # Supabase client, admin, and auth helpers
├── theme/                    # MUI theme with light/dark variants
├── constants/                # App constants and form schemas
├── types/                    # TypeScript types (including generated Supabase types)
└── proxy.ts                  # Middleware: IP restriction, auth, role-based routing
```

## Database

**Tables:** `users`, `products`, `categories`, `variants`, `product_comments`, `product_comment_pins`, `product_comment_votes`

**Storage Buckets:** `avatars`, `product-media`

All tables have RLS enabled with role-based policies. Write operations are restricted to Admin and Manager roles.

## License

All rights reserved.
