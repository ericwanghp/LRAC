# Architecture Design Document
# LRAC Framework Introduction Website

**Project Name**: LRAC Framework Introduction Website
**Document Version**: 1.1
**Created**: 2026-03-13
**Last Updated**: 2026-03-13
**Status**: Approved
**Author**: architect (AI Agent)
**Reviewer**: architect-reviewer (AI Agent)

---

## Document Information

| Field | Value |
|-------|-------|
| Project | LRAC Framework Introduction Website |
| Architecture Pattern | Static Site with ISR (Incremental Static Regeneration) |
| Deployment Target | Vercel (Edge Network) |
| Primary Language | TypeScript |
| Framework | Next.js 14+ (App Router) |

### References

| Document | Location |
|----------|----------|
| BRD | [docs/brd/BRD-lrac-website.md](../brd/BRD-lrac-website.md) |
| PRD | [docs/prd/PRD-lrac-website.md](../prd/PRD-lrac-website.md) |
| Competitive Analysis | [docs/research/COMPETITIVE-ANALYSIS-ai-agent-frameworks.md](../research/COMPETITIVE-ANALYSIS-ai-agent-frameworks.md) |

---

## 1. Executive Summary

### 1.1 Architecture Overview

The LRAC Framework Introduction Website is a multi-page marketing and documentation website built with **Next.js 14+ App Router**, designed for optimal performance, SEO, and developer experience. The architecture follows a **static-first approach** with Incremental Static Regeneration (ISR) for dynamic content like GitHub star counts.

### 1.2 Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 14+ App Router | Best-in-class SEO, performance, React ecosystem |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, consistent design system |
| **Deployment** | Vercel | Optimized for Next.js, global edge network, free tier |
| **Content Strategy** | Static generation with ISR | Fast page loads, fresh data for dynamic content |
| **Animation** | Framer Motion | Declarative animations, React integration |
| **Code Highlighting** | Shiki (via rehype-shiki) | Accurate syntax highlighting, multiple themes |
| **Diagrams** | Mermaid.js | Interactive process diagrams |

### 1.3 System Context (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              External Systems                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Users     │    │   GitHub    │    │  Analytics  │    │   Search   │  │
│  │ (Browsers)  │    │    API      │    │  (Plausible)│    │  Engines   │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │         │
│         ▼                  ▼                  ▼                  ▼         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     LRAC Website (Vercel Edge)                      │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │   Home    │  │ Features  │  │  Agents   │  │  Process  │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐                       │   │
│  │  │   Docs    │  │  Getting  │  │  Contact  │                       │   │
│  │  │           │  │  Started  │  │           │                       │   │
│  │  └───────────┘  └───────────┘  └───────────┘                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Core Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 14.x | React framework with SSR/SSG |
| **Language** | TypeScript | 5.x | Type-safe development |
| **React** | React | 18.x | UI component library |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Components** | shadcn/ui | Latest | Accessible component library |
| **Animation** | Framer Motion | 11.x | Declarative animations |
| **Forms** | React Hook Form | 7.x | Form state management |
| **Validation** | Zod | 3.x | Schema validation |
| **Code Highlighting** | Shiki | 1.x | Syntax highlighting |
| **Diagrams** | Mermaid.js | 10.x | Flowchart rendering |
| **Rate Limiting** | Upstash Redis | 1.x | Serverless Redis for API rate limiting |

### 2.2 Development Tools

| Category | Tool | Purpose |
|----------|------|---------|
| **Package Manager** | pnpm | Fast, disk-efficient package management |
| **Linting** | ESLint | Code quality enforcement |
| **Formatting** | Prettier | Code formatting |
| **Type Checking** | TypeScript | Static type analysis |
| **Testing** | Vitest + Playwright | Unit and E2E testing |
| **Git Hooks** | Husky + lint-staged | Pre-commit validation |

### 2.3 Deployment & Infrastructure

| Category | Service | Purpose |
|----------|---------|---------|
| **Hosting** | Vercel | Edge deployment, automatic CI/CD |
| **Analytics** | Plausible | Privacy-focused analytics |
| **Email Service** | Resend | Transactional email for contact form submissions |
| **Rate Limiting** | Upstash Redis | Serverless Redis for API rate limiting |
| **Forms** | Vercel Forms (fallback) | Backup contact form handling |
| **CDN** | Vercel Edge Network | Global content delivery |
| **DNS** | Vercel / Cloudflare | Domain management |

### 2.4 Technology Selection Rationale

#### Why Next.js 14+ App Router?

| Factor | Decision | Rationale |
|--------|----------|-----------|
| **SEO** | Critical | SSR/SSG ensures crawlers see full content |
| **Performance** | High | Built-in optimizations (Image, Font, Script) |
| **Developer Experience** | High | Familiar React patterns, excellent tooling |
| **Ecosystem** | Mature | Large plugin ecosystem, active community |
| **Deployment** | Optimized | First-class Vercel integration |

#### Why Tailwind CSS + shadcn/ui?

| Factor | Decision | Rationale |
|--------|----------|-----------|
| **Development Speed** | High | Utility classes for rapid prototyping |
| **Consistency** | High | Design tokens ensure visual consistency |
| **Accessibility** | High | shadcn/ui components are WCAG-compliant |
| **Customization** | High | Full control over component styles |
| **Bundle Size** | Optimized | PurgeCSS removes unused styles |

#### Why Vercel?

| Factor | Decision | Rationale |
|--------|----------|-----------|
| **Performance** | Critical | Global edge network, automatic optimization |
| **Integration** | Seamless | Native Next.js support |
| **Cost** | Free tier | Suitable for MVP, scales with traffic |
| **Developer Experience** | High | Preview deployments, instant rollbacks |
| **Analytics** | Built-in | Web Vitals monitoring |

---

## 3. System Architecture

### 3.1 High-Level Architecture (C4 Level 2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LRAC Website Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          Presentation Layer                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   Layout    │  │   Pages     │  │  Components │  │   Hooks    │ │   │
│  │  │  (RootLayout)│  │ (6 routes)  │  │  (shadcn)   │  │ (state)    │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           Data Layer                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Static     │  │   GitHub    │  │   Contact   │  │  Analytics │ │   │
│  │  │  Content    │  │    API      │  │   Service   │  │  (Plausible)│ │   │
│  │  │  (MDX)      │  │  (ISR)      │  │             │  │            │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       Infrastructure Layer                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   Vercel    │  │    Edge     │  │     CI/CD   │  │   CDN      │ │   │
│  │  │  Platform   │  │   Runtime   │  │  (GitHub)   │  │  (Global)  │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Directory Structure

```
lrac-website/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (navigation, footer)
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global styles (Tailwind)
│   ├── features/
│   │   └── page.tsx              # Features page
│   ├── agents/
│   │   ├── page.tsx              # Agents listing page
│   │   └── [id]/
│   │       └── page.tsx          # Agent detail modal/page
│   ├── process/
│   │   └── page.tsx              # Process diagram page
│   ├── docs/
│   │   └── page.tsx              # Documentation page
│   ├── getting-started/
│   │   └── page.tsx              # Quick start guide
│   ├── contact/
│   │   └── page.tsx              # Contact form page
│   └── api/
│       ├── github-stars/
│       │   └── route.ts          # GitHub API proxy (ISR)
│       └── contact/
│           └── route.ts          # Contact form handler
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── Navigation.tsx        # Main navigation
│   │   ├── Footer.tsx            # Site footer
│   │   └── MobileMenu.tsx        # Mobile navigation
│   ├── home/                     # Home page components
│   │   ├── Hero.tsx              # Hero section
│   │   ├── FeaturesGrid.tsx      # Key features grid
│   │   └── SocialProof.tsx       # Testimonials/stats
│   ├── features/                 # Features page components
│   │   ├── FeatureCard.tsx       # Feature card
│   │   └── CodeExample.tsx       # Syntax-highlighted code
│   ├── agents/                   # Agents page components
│   │   ├── AgentCard.tsx         # Agent card
│   │   ├── AgentGrid.tsx         # Grid layout
│   │   ├── AgentFilter.tsx       # Category filters
│   │   └── AgentModal.tsx        # Detail modal
│   ├── process/                  # Process page components
│   │   ├── ProcessDiagram.tsx    # Mermaid diagram
│   │   └── PhaseAccordion.tsx    # Phase details
│   └── shared/                   # Shared components
│       ├── CodeBlock.tsx         # Syntax highlighting wrapper
│       ├── CopyButton.tsx        # Copy to clipboard
│       ├── SearchInput.tsx       # Search component
│       └── Toast.tsx             # Toast notifications
├── lib/
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   ├── github.ts                 # GitHub API client
│   ├── agents.ts                 # Agent data and types
│   └── constants.ts              # Site constants
├── data/
│   ├── agents.json               # Agent role data (37 agents)
│   ├── features.json             # Feature descriptions
│   ├── phases.json               # 8-phase process data
│   └── testimonials.json         # Social proof data
├── hooks/
│   ├── useGitHubStars.ts         # GitHub stars hook
│   ├── useAgentFilter.ts         # Agent filtering logic
│   └── useCopyToClipboard.ts     # Clipboard hook
├── types/
│   ├── agent.ts                  # Agent types
│   ├── feature.ts                # Feature types
│   └── api.ts                    # API response types
├── public/
│   ├── images/                   # Static images
│   │   ├── logo.svg
│   │   ├── og-image.png
│   │   └── agents/               # Agent icons
│   ├── fonts/                    # Self-hosted fonts
│   └── favicon.ico
├── styles/
│   └── code-themes/              # Shiki themes
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json
└── README.md
```

### 3.3 Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Component Hierarchy                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RootLayout                                                                 │
│  ├── ThemeProvider                                                          │
│  ├── Navigation                                                             │
│  │   ├── Logo                                                               │
│  │   ├── NavLinks (Home, Features, Agents, Process, Docs, Getting Started) │
│  │   ├── GitHubStarsBadge                                                   │
│  │   └── CTAButton                                                          │
│  ├── Main Content                                                           │
│  │   └── [Page Components]                                                  │
│  └── Footer                                                                 │
│      ├── FooterLinks                                                        │
│      ├── SocialLinks                                                        │
│      └── Copyright                                                          │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  HomePage                                                                   │
│  ├── Hero                                                                   │
│  │   ├── Headline                                                           │
│  │   ├── Subheadline                                                        │
│  │   ├── PrimaryCTA                                                         │
│  │   └── SecondaryCTA                                                       │
│  ├── FeaturesGrid                                                           │
│  │   └── FeatureCard[]                                                      │
│  ├── SocialProof                                                            │
│  │   ├── StatsRow                                                           │
│  │   └── TestimonialCards                                                   │
│  └── CTASection                                                             │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  AgentsPage                                                                 │
│  ├── AgentFilter                                                            │
│  │   ├── SearchInput                                                        │
│  │   └── CategoryFilters[]                                                  │
│  ├── AgentGrid                                                              │
│  │   └── AgentCard[]                                                        │
│  │       ├── AgentIcon                                                      │
│  │       ├── AgentName                                                      │
│  │       ├── CategoryBadge                                                  │
│  │       └── Description                                                    │
│  └── AgentModal (Dialog)                                                    │
│      ├── AgentHeader                                                        │
│      ├── UseCasesList                                                       │
│      ├── CodeExample                                                        │
│      │   └── CopyButton                                                     │
│      └── RelatedAgents                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Architecture

### 4.1 Data Sources

| Data Type | Source | Update Frequency | Access Pattern |
|-----------|--------|------------------|----------------|
| **Page Content** | Static JSON/MDX | Build time | SSG |
| **Agent Roles** | Static JSON | Build time | SSG |
| **GitHub Stars** | GitHub API | 1 hour (ISR) | Client + ISR |
| **Contact Forms** | API Route | Real-time | POST |
| **Analytics** | Plausible | Real-time | Client-side |

### 4.2 Data Models

#### Agent Role Model

```typescript
interface Agent {
  id: string;                    // e.g., "frontend-dev"
  name: string;                  // e.g., "Frontend Developer"
  category: AgentCategory;       // Development, Data, Security, etc.
  description: string;           // Short description
  fullDescription: string;       // Detailed description
  skills: string[];              // List of skills
  useCases: string[];            // 3-5 use case bullets
  examplePrompts: string[];      // Example user prompts
  codeExample?: {
    language: string;
    code: string;
  };
  relatedAgents: string[];       // IDs of related agents
  icon: string;                  // Icon identifier
}

type AgentCategory = 
  | 'development'
  | 'data'
  | 'security'
  | 'product'
  | 'documentation'
  | 'research';
```

#### Feature Model

```typescript
interface Feature {
  id: string;
  title: string;
  description: string;
  category: FeatureCategory;
  benefits: string[];
  codeExample?: CodeExample;
  link?: string;
  icon: string;
}

interface CodeExample {
  title: string;
  language: string;
  code: string;
  output?: string;
}
```

#### Process Phase Model

```typescript
interface Phase {
  number: number;                // 1-8
  name: string;
  shortName: string;
  description: string;
  participants: string[];        // Agent roles involved
  deliverables: string[];
  skills: string[];              // Skills required
  inputs: string[];              // What comes in
  outputs: string[];             // What comes out
  duration: string;              // Typical duration
}
```

### 4.3 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Data Flow Diagram                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                                                            │
│  │   Static    │                                                            │
│  │   Content   │──────► Build Time ──────► Static Pages                    │
│  │  (JSON/MDX) │           │                                               │
│  └─────────────┘           │                                               │
│                            ▼                                               │
│  ┌─────────────┐     ┌───────────┐                                         │
│  │   GitHub    │────►│   ISR     │────► /api/github-stars                 │
│  │    API      │     │ (1 hour)  │      (revalidates periodically)        │
│  └─────────────┘     └───────────┘                                         │
│                            │                                               │
│                            ▼                                               │
│                     ┌───────────┐                                          │
│                     │  Client   │                                          │
│                     │  Hydration│────► Interactive UI                     │
│                     └───────────┘                                          │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Contact Form Flow:                                                         │
│                                                                             │
│  ┌─────────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐    │
│  │   Contact   │────►│  Zod      │────►│  API      │────►│  Resend   │    │
│  │   Form      │     │ Validation│     │  Route    │     │  Email    │    │
│  └─────────────┘     └───────────┘     └───────────┘     └───────────┘    │
│                            │                    │                          │
│                            ▼                    ▼                          │
│                       Error State        Success State                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Page Specifications

### 5.1 Page Routes

| Route | Page | SSR/SSG | Revalidation |
|-------|------|---------|--------------|
| `/` | Home | SSG | 1 hour |
| `/features` | Features | SSG | 24 hours |
| `/agents` | Agents | SSG | 24 hours |
| `/agents/[id]` | Agent Detail | SSG | 24 hours |
| `/process` | Process | SSG | 24 hours |
| `/docs` | Documentation | SSG | 24 hours |
| `/getting-started` | Getting Started | SSG | 24 hours |
| `/contact` | Contact | SSG | 24 hours |
| `/api/github-stars` | GitHub API | ISR | 1 hour |
| `/api/contact` | Contact Handler | SSR | N/A |

### 5.2 Page Component Map

**Server vs Client Components**: In Next.js 14 App Router, components are Server Components by default. Client Components are marked with `'use client'` directive.

#### Home Page (`/`)

```typescript
// app/page.tsx (Server Component)
import { Hero } from '@/components/home/Hero';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { SocialProof } from '@/components/home/SocialProof';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturesGrid />
      <SocialProof />
      <CTASection />
    </main>
  );
}
```

#### Agents Page (`/agents`)

```typescript
// app/agents/page.tsx (Server Component)
import { PageHeader } from '@/components/common/PageHeader';
import { AgentFilter } from '@/components/agents/AgentFilter'; // Client Component
import { AgentGrid } from '@/components/agents/AgentGrid'; // Client Component
import { agentsData } from '@/data/agents';

export default function AgentsPage() {
  return (
    <main>
      <PageHeader title="Agent Roles" description="..." />
      <AgentFilter />
      <AgentGrid agents={agentsData} />
    </main>
  );
}
```

**Agent Detail Strategy**: Agent details are displayed via **modal overlay** (not separate pages) on the `/agents` page for better UX. The `/agents/[id]` route exists for **deep linking** and **SEO purposes** but renders the same modal content.

### 5.3 SEO Configuration

```typescript
// Per-page metadata
export const metadata: Metadata = {
  title: 'LRAC Framework - Structured AI Agent Development',
  description: 'The only AI agent framework with an 8-phase development process...',
  openGraph: {
    title: 'LRAC Framework',
    description: '...',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LRAC Framework',
    description: '...',
    images: ['/og-image.png'],
  },
};
```

---

## 6. API Design

### 6.1 API Routes

#### GET /api/github-stars

**Purpose**: Fetch GitHub star count with caching

**Response**:
```json
{
  "stars": 1234,
  "forks": 567,
  "updatedAt": "2026-03-13T00:00:00Z"
}
```

**Environment Variables**:
- `GITHUB_TOKEN`: GitHub Personal Access Token
  - **Required Scopes**: `public_repo` (read-only access to public repositories)
  - **Purpose**: Increases GitHub API rate limit from 60 to 5000 requests/hour
  - **Optional**: If not provided, falls back to unauthenticated API (60 req/hour)

**Caching**: ISR with 1-hour revalidation

**Error Handling**: Returns `{ "stars": null, "error": "..." }` with 200 status (graceful degradation)

#### POST /api/contact

**Purpose**: Handle contact form submissions

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc.",
  "message": "I'm interested in..."
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Thank you for your message. We'll be in touch soon."
}
```

**Response** (Error):
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

**Rate Limiting**: 3 requests per hour per IP

---

## 7. Design System

### 7.1 Color Palette

Based on BRD/PRD specifications and competitive analysis (professional dark theme):

```css
/* tailwind.config.ts colors */
colors: {
  background: {
    DEFAULT: '#0A0A0F',    /* Page backgrounds */
    surface: '#14141F',    /* Cards, sections */
    elevated: '#1E1E2E',   /* Modals, dropdowns */
  },
  primary: {
    DEFAULT: '#6366F1',    /* Indigo - CTAs, highlights */
    hover: '#818CF8',
    muted: '#4F46E5',
  },
  secondary: {
    DEFAULT: '#8B5CF6',    /* Purple - Gradients, emphasis */
    hover: '#A78BFA',
  },
  accent: {
    success: '#10B981',    /* Green - Success states */
    warning: '#F59E0B',    /* Amber - Warnings */
    error: '#EF4444',      /* Red - Errors */
  },
  text: {
    primary: '#F9FAFB',    /* Main text */
    secondary: '#9CA3AF',  /* Secondary text, captions */
    muted: '#6B7280',      /* Disabled, placeholders */
  },
  border: {
    DEFAULT: '#374151',    /* Default borders */
    subtle: '#1F2937',     /* Subtle dividers */
  },
}
```

### 7.2 Typography

```css
/* Font configuration */
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
}

/* Font sizes (rem) */
fontSize: {
  'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
  'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
  'h2': ['2rem', { lineHeight: '1.25', fontWeight: '600' }],
  'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
  'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
  'body': ['1rem', { lineHeight: '1.6' }],
  'small': ['0.875rem', { lineHeight: '1.5' }],
  'code': ['0.875rem', { lineHeight: '1.6' }],
}
```

### 7.3 Component Tokens

```css
/* Spacing scale */
spacing: {
  'section': '5rem',      /* Section padding */
  'card-gap': '1.5rem',   /* Grid gap */
  'card-padding': '1.5rem',
}

/* Border radius */
borderRadius: {
  'card': '0.75rem',
  'button': '0.5rem',
  'input': '0.375rem',
}

/* Shadows */
boxShadow: {
  'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
  'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
}
```

### 7.4 Animation Tokens

```typescript
// Framer Motion variants
const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4 },
};
```

---

## 8. Performance Architecture

### 8.1 Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| **First Contentful Paint** | < 1.5s | Critical CSS inline, preload fonts |
| **Largest Contentful Paint** | < 2.5s | Image optimization, lazy loading |
| **Time to Interactive** | < 3s | Code splitting, tree shaking |
| **Cumulative Layout Shift** | < 0.1 | Size placeholders, font loading |
| **Total Bundle Size** | < 200KB | Dynamic imports, minimal dependencies |

### 8.2 Optimization Strategies

#### Code Splitting

```typescript
// Dynamic imports for heavy components
const MermaidDiagram = dynamic(
  () => import('@/components/process/ProcessDiagram'),
  { 
    loading: () => <DiagramSkeleton />,
    ssr: false  // Mermaid requires client-side rendering
  }
);

const AgentModal = dynamic(
  () => import('@/components/agents/AgentModal'),
  { loading: () => null }
);
```

#### Image Optimization

```typescript
// next/image configuration
<Image
  src="/images/hero.png"
  alt="LRAC Framework"
  width={1200}
  height={630}
  priority // For above-fold images
  placeholder="blur"
  blurDataURL="..." // Base64 placeholder
/>
```

#### Font Loading

```typescript
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});
```

### 8.3 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Caching Layers                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Browser Cache (Static Assets)                                              │
│  ├── /_next/static/* → immutable, max-age=31536000                         │
│  ├── /images/* → public, max-age=86400, stale-while-revalidate             │
│  └── /fonts/* → public, max-age=31536000, immutable                        │
│                                                                             │
│  Vercel Edge Cache (CDN)                                                    │
│  ├── Static pages → revalidate: 86400 (24 hours)                           │
│  ├── /api/github-stars → revalidate: 3600 (1 hour)                         │
│  └── /api/contact → no-cache (dynamic)                                     │
│                                                                             │
│  ISR (Incremental Static Regeneration)                                      │
│  └── GitHub stars data → revalidate every 1 hour                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Security Architecture

### 9.1 Security Headers

```typescript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' plausible.io;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.github.com plausible.io;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim(),
  },
];
```

### 9.2 Input Validation

```typescript
// Contact form validation with Zod
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().max(100).optional(),
  message: z.string().min(10).max(5000),
});

// Rate limiting with Upstash (Next.js App Router compatible)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour
  analytics: true,
  prefix: "@upstash/ratelimit/contact",
});

// Usage in API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429 }
    );
  }

  // Process contact form submission
  // ...
}
```

### 9.3 Privacy Considerations

| Consideration | Implementation |
|---------------|----------------|
| **Analytics** | Plausible (no cookies, GDPR compliant) |
| **No Tracking** | No third-party tracking pixels |
| **Minimal Data** | Contact form collects only necessary fields |
| **Data Retention** | Contact submissions deleted after 30 days |
| **Cookie Consent** | Not required (no cookies used) |

---

## 10. Deployment Architecture

### 10.1 Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Deployment Pipeline                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│  │  Commit  │────►│  GitHub  │────►│   CI     │────►│  Deploy  │          │
│  │  (main)  │     │  Actions │     │  Tests   │     │ (Vercel) │          │
│  └──────────┘     └──────────┘     └──────────┘     └──────────┘          │
│                          │               │                │                │
│                          ▼               ▼                ▼                │
│                    ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│                    │  Lint    │    │  Lighthouse│   │  Preview │           │
│                    │  Check   │    │   CI      │    │  URL     │           │
│                    └──────────┘    └──────────┘    └──────────┘           │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Branch Strategy:                                                           │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                           │
│  │  main    │────►│  Preview │────►│ Production│                          │
│  │          │     │  Deploy  │     │  Deploy   │                          │
│  └──────────┘     └──────────┘     └──────────┘                           │
│                                                                             │
│  Environment Variables:                                                     │
│  ├── NEXT_PUBLIC_SITE_URL                                                  │
│  ├── NEXT_PUBLIC_PLAUSIBLE_DOMAIN                                          │
│  ├── GITHUB_TOKEN (server-side)                                            │
│  └── RESEND_API_KEY (server-side)                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "fra1"],
  "functions": {
    "app/api/contact/route.ts": {
      "memory": 256,
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/github",
      "destination": "https://github.com/anthropic/lrac",
      "permanent": false
    }
  ]
}
```

### 10.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:unit
      
  lighthouse:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - run: pnpm build
      - uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: ./lighthouserc.json
          temporaryPublicStorage: true
```

---

## 11. Testing Strategy

### 11.1 Test Pyramid

```
                    ┌─────────┐
                   /    E2E    \        10% - Critical user flows
                  /─────────────\
                 /  Integration  \     20% - Component interactions
                /─────────────────\
               /     Unit Tests    \   70% - Utilities, hooks, components
              /─────────────────────\
```

### 11.2 Test Categories

| Category | Tool | Coverage Target | Scope |
|----------|------|-----------------|-------|
| **Unit** | Vitest | 80% | Utilities, hooks, pure components |
| **Integration** | Vitest + Testing Library | 60% | Component interactions, forms |
| **E2E** | Playwright | Critical paths | User journeys, forms |
| **Visual** | Chromatic (optional) | Key components | UI regression |
| **Accessibility** | axe-core | 100% WCAG AA | All interactive elements |

### 11.3 Test Files Structure

```
__tests__/
├── unit/
│   ├── utils.test.ts
│   ├── hooks/
│   │   ├── useAgentFilter.test.ts
│   │   └── useCopyToClipboard.test.ts
│   └── lib/
│       └── github.test.ts
├── integration/
│   ├── components/
│   │   ├── AgentGrid.test.tsx
│   │   ├── ContactForm.test.tsx
│   │   └── ProcessDiagram.test.tsx
│   └── pages/
│       └── home.test.tsx
└── e2e/
    ├── navigation.spec.ts
    ├── agents-flow.spec.ts
    ├── contact-form.spec.ts
    └── getting-started.spec.ts
```

---

## 12. Monitoring & Observability

### 12.1 Monitoring Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Performance** | Vercel Analytics + Lighthouse CI | Core Web Vitals |
| **Errors** | Sentry (optional) | Error tracking for production debugging |
| **Analytics** | Plausible | User behavior |
| **Uptime** | Vercel Status Page | Availability |

**ADR: Sentry Usage Decision**

| Decision | Rationale |
|----------|-----------|
| **Initial Launch**: Disabled | Static site with minimal error surface; Vercel provides basic error logging |
| **Enable When**: Error rates increase | Enable Sentry if contact form errors, API failures, or user-reported issues exceed threshold |
| **Configuration**: Opt-in | Use environment variable `NEXT_PUBLIC_SENTRY_DSN` to enable when needed |
| **Cost**: Free tier sufficient | Free tier (5K errors/month) adequate for expected traffic |

### 12.2 Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| **Availability** | 99.9% | < 99.5% |
| **P95 Response Time** | < 500ms | > 1s |
| **Error Rate** | < 0.1% | > 1% |
| **Lighthouse Score** | > 90 | < 85 |

---

## 13. Scalability Considerations

### 13.1 Horizontal Scaling

The architecture is designed for **serverless scaling**:

- **Vercel Edge Functions**: Automatically scale with traffic
- **Static Assets**: Served from global CDN, no server load
- **ISR**: Reduces API calls to GitHub (1/hour regardless of traffic)

### 13.2 Future Growth

| Growth Scenario | Current Architecture | Future Solution |
|-----------------|---------------------|-----------------|
| **10x Traffic** | Handles automatically | No change needed |
| **Blog Addition** | MDX support exists | Add /blog route |
| **Multi-language** | i18n routing ready | Add locale files |
| **Interactive Demos** | Not supported | Add WebContainer API |
| **User Auth** | Not supported | Add NextAuth.js |

---

## 14. Risk Assessment

### 14.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **GitHub API Rate Limits** | Medium | Low | ISR caching, fallback to static |
| **Mermaid.js Bundle Size** | Low | Medium | Dynamic import, SSR disabled |
| **Vercel Downtime** | Low | High | Monitor + automatic recovery |
| **Third-party Font Loading** | Low | Low | Self-host fonts, fallback fonts |

### 14.2 Mitigation Strategies

1. **Graceful Degradation**: All features have static fallbacks
2. **Progressive Enhancement**: Core content works without JS
3. **Error Boundaries**: React error boundaries for component failures
4. **Monitoring Alerts**: Proactive notification on issues

---

## 15. Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up ESLint, Prettier, Husky
- [ ] Create base layout and navigation
- [ ] Implement design tokens

### Phase 2: Core Pages (Week 2)

- [ ] Home page (Hero, Features Grid, Social Proof)
- [ ] Features page
- [ ] Getting Started page
- [ ] Documentation page

### Phase 3: Interactive Features (Week 3)

- [ ] Agents page with filter/search
- [ ] Agent detail modal
- [ ] Process page with Mermaid diagram
- [ ] Contact form

### Phase 4: Polish & Deploy (Week 4)

- [ ] Responsive design optimization
- [ ] Performance optimization
- [ ] SEO implementation
- [ ] Analytics setup
- [ ] Production deployment

---

## 16. Acceptance Criteria

### Architecture Review Checklist

- [ ] Technology stack aligns with PRD requirements
- [ ] Component architecture supports all user stories
- [ ] Performance targets are achievable
- [ ] Security requirements are addressed
- [ ] Deployment strategy is clearly defined
- [ ] Testing strategy covers all critical paths
- [ ] Scalability considerations documented
- [ ] Risks identified and mitigated

### Sign-Off Requirements

| Reviewer | Focus Area | Status |
|----------|------------|--------|
| **architect-reviewer** | Overall architecture, technology choices | Pending |
| **frontend-dev** | Component architecture, DX | Pending |
| **devops-engineer** | Deployment, infrastructure | Pending |
| **security-specialist** | Security architecture | Pending |

---

## Appendix A: ADR (Architecture Decision Records)

### ADR-001: Choose Next.js over Astro

**Status**: Accepted

**Context**: Need a framework for a multi-page marketing website with some dynamic content (GitHub stars, contact forms).

**Decision**: Use Next.js 14 with App Router instead of Astro.

**Rationale**:
- Team familiarity with React ecosystem
- Better component reuse with shadcn/ui
- ISR for dynamic content is simpler
- Future interactive features (demos) easier to add

**Consequences**:
- Larger bundle size than pure static
- Requires Node.js runtime for some features

### ADR-002: Use shadcn/ui over Material UI

**Status**: Accepted

**Context**: Need a component library for rapid development with accessibility.

**Decision**: Use shadcn/ui with Tailwind CSS.

**Rationale**:
- Full control over component code (copy, not dependency)
- Native Tailwind integration
- Excellent accessibility out of the box
- Smaller bundle size (tree-shakeable)

**Consequences**:
- More initial setup than pre-built library
- Components live in codebase, need maintenance

### ADR-003: Plausible over Google Analytics

**Status**: Accepted

**Context**: Need analytics for user behavior tracking.

**Decision**: Use Plausible Analytics.

**Rationale**:
- Privacy-focused, no cookies required
- GDPR compliant by default
- Lightweight script (< 1KB)
- Simple, clear dashboard

**Consequences**:
- Less detailed analytics than GA4
- Paid service (or self-host)

---

## Appendix B: Environment Variables

```bash
# .env.local (DO NOT COMMIT)

# Public variables (exposed to browser)
NEXT_PUBLIC_SITE_URL=https://lrac.dev
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=lrac.dev

# Server-side only (keep secret)
GITHUB_TOKEN=ghp_xxxxx
RESEND_API_KEY=re_xxxxx
```

---

## Appendix C: Third-Party Dependencies

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| next | 14.x | MIT | Framework |
| react | 18.x | MIT | UI library |
| tailwindcss | 3.x | MIT | Styling |
| framer-motion | 11.x | MIT | Animation |
| zod | 3.x | MIT | Validation |
| react-hook-form | 7.x | MIT | Form handling |
| shiki | 1.x | MIT | Syntax highlighting |
| mermaid | 10.x | MIT | Diagrams |
| lucide-react | Latest | ISC | Icons |

---

**Document Status**: Draft - Awaiting Review
**Last Updated**: 2026-03-13
**Next Review**: architect-reviewer approval required
