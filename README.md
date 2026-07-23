# JobOps - Self-Hosted Job Search Automation

A comprehensive job search automation dashboard built with Next.js 14, Prisma, and AI-powered job scoring.

## Features

### Phase 1-6: Core MVP
- **Job Search**: Query 8+ job sources simultaneously (RemoteOK, Adzuna, CareerJet, USAJobs, AngelList, Built In, manual entry, CSV import)
- **Application Tracking**: Kanban board with 9 workflow statuses (Saved → Preparing → Applied → Interviewing → Assessment → Offer → Rejected → Withdrawn → Archived)
- **AI Job Scoring**: Fit score (0-100), matched/missing skills, seniority fit, recommendation
- **CV Tailoring**: Resume customization with truth-check validation (no hallucinations)
- **Profile Management**: Work auth, visa sponsorship, target locations, skills inventory
- **Recruiter Tracking**: Store contact info, follow-up dates, notes per application

### Phase 7: Gmail Integration
- **Read-Only OAuth**: Secure Gmail connection (read-only access)
- **Email Sync**: Detect interview requests, offers, rejections from emails
- **Auto-Status Updates**: Application status changes based on email content

### Phase 8: Settings & Docs
- **AI Provider Config**: Switch between OpenAI, Gemini, OpenRouter, Ollama
- **Job Source Toggles**: Enable/disable extractors
- **Dashboard Metrics**: Total applications, funnel stats, offer rate

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript strict mode, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Prisma ORM, Zod validation
- **Database**: SQLite (dev), PostgreSQL (prod)
- **AI**: OpenAI/Gemini/OpenRouter/Ollama abstraction
- **Deployment**: Docker Compose, multi-stage builds

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed test data
npx prisma db seed

# Start dev server
npm run dev
```

Visit http://localhost:3000

### Production

```bash
# Build Docker image
docker build -t jobops:latest .

# Run with Compose
docker-compose -f docker-compose.prod.yml up

# Database migrations
npx prisma migrate deploy
```

## Environment Setup

Required for full functionality:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost/jobops"

# AI Providers (optional - at least one required for scoring)
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."
OPENROUTER_API_KEY="..."
OLLAMA_BASE_URL="http://localhost:11434"

# Gmail (optional - Phase 7)
GMAIL_CLIENT_ID="..."
GMAIL_CLIENT_SECRET="..."
GMAIL_REDIRECT_URI="http://localhost:3000/api/gmail/callback"

# Auth (optional)
NEXTAUTH_SECRET="..."
```

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── dashboard/
│   ├── jobs/
│   ├── applications/
│   ├── profile/
│   ├── settings/
│   └── api/
│       ├── search/         # Job search pipeline
│       ├── score/          # AI job scoring
│       ├── tailor/         # Resume tailoring
│       └── gmail/          # Gmail sync
├── server/
│   ├── extractors/         # Job source adapters
│   │   ├── remoteok.ts
│   │   ├── adzuna.ts
│   │   ├── careerjet.ts
│   │   ├── usajobs.ts
│   │   ├── angellist.ts
│   │   ├── builtin.ts
│   │   └── registry.ts
│   ├── jobs/
│   │   ├── searchPipeline.ts
│   │   └── dedupe.ts
│   ├── ai/
│   │   ├── scoring.ts      # AI provider abstraction
│   │   ├── openai.ts
│   │   ├── ollama.ts
│   │   └── types.ts
│   ├── resume/
│   │   ├── tailor.ts       # Resume customization
│   │   ├── pdf.ts
│   │   └── actions.ts
│   ├── applications/
│   │   └── actions.ts      # Application management
│   └── gmail/              # Gmail integration
│       ├── auth.ts
│       ├── sync.ts
│       └── actions.ts
├── components/
│   ├── jobs/
│   │   ├── JobSearchForm.tsx
│   │   └── JobCard.tsx
│   ├── applications/
│   │   ├── ApplicationKanban.tsx
│   │   └── ApplicationDetailPanel.tsx
│   └── profile/
│       └── ProfileForm.tsx
└── lib/
    ├── db.ts               # Prisma client
    ├── env.ts              # Environment validation
    └── logger.ts           # Logging

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed data
```

## API Endpoints

### Search
- `POST /api/search` - Search jobs across all sources
  ```json
  {
    "query": "DevOps Engineer",
    "location": "San Francisco, CA",
    "postedInLastDays": 7,
    "remoteOnly": true
  }
  ```

### Scoring
- `POST /api/score` - Score a job against user profile
  ```json
  {
    "jobId": "job-123",
    "profileId": "profile-456",
    "jobDescription": "...",
    "jobTitle": "...",
    "company": "...",
    "providerName": "openai"
  }
  ```

### Resume Tailoring
- `POST /api/tailor` - Tailor resume for specific job
  ```json
  {
    "profileId": "profile-123",
    "jobId": "job-456",
    "jobTitle": "DevOps Engineer",
    "jobDescription": "..."
  }
  ```

### Gmail Sync
- `POST /api/gmail/sync` - Sync emails and update application status
  ```json
  {
    "profileId": "profile-123"
  }
  ```

## Compliance

- **No Auto-Apply**: Manual application only via Kanban board
- **No CAPTCHA Bypass**: Users solve CAPTCHAs themselves
- **No Restricted Scraping**: LinkedIn, Indeed, Glassdoor disabled (ToS violation)
- **Truth-Check Resume**: No hallucinated skills/employers/dates
- **Read-Only Gmail**: OAuth scope limited to reading (no deletion/modification)

## Roadmap

- [ ] Email template suggestions for cover letters
- [ ] Salary negotiation tracker
- [ ] Interview preparation materials
- [ ] Job market analytics dashboard
- [ ] Mobile app (React Native)

## Contributing

Community contributions welcome. Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with description

## License

MIT
