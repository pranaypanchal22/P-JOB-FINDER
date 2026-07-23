# JobOps Build Progress

## Phase 1: ✅ COMPLETE
Foundation scaffold built and verified.

### Completed
- [x] Next.js 14 + TypeScript + Tailwind CSS
- [x] Prisma ORM with SQLite for dev
- [x] All database models implemented (UserProfile, Job, JobScore, ResumeVersion, Application, ApplicationEvent, GmailAccount, GmailMessage, ExtractorRun, Setting)
- [x] Environment variable validation (getEnv() in src/lib/env.ts)
- [x] Prisma seed with test data (1 profile, 4 jobs, 3 applications with different statuses)
- [x] Docker + docker-compose.yml for dev (SQLite)
- [x] Docker + docker-compose.prod.yml for production (PostgreSQL)
- [x] Dockerfile with development and production stages
- [x] Dashboard shell with sidebar navigation, topbar, and empty page stubs
- [x] All route stubs created (/dashboard, /jobs, /jobs/[id], /applications, /profile, /imports, /settings)
- [x] All API route stubs created (/api/search, /api/jobs, /api/score, /api/tailor, /api/export, /api/gmail/callback, /api/gmail/sync)
- [x] Utility functions (slug, normalize, format date/currency)
- [x] Logger class for logging

### Verification
- [x] `npm install` completes successfully
- [x] `prisma db push` creates SQLite database
- [x] `prisma db seed` populates test data
- [x] `npm run build` compiles without errors
- [x] `npm run dev` serves dashboard shell on http://localhost:3000
- [x] Shell layout renders correctly (sidebar, topbar, main content)
- [x] Navigation links functional

### Database Verified
- 1 UserProfile created (alex@example.com)
- 4 Jobs created (2 from RemoteOK, 2 manual)
- 3 Applications created in different statuses (saved, applied, interviewing)
- 3 ApplicationEvents created for timeline tracking

---

## Phase 2: Job Search (One Source End-to-End)
Next steps:
- [ ] Implement JobExtractor interface and registry
- [ ] Implement RemoteOK extractor (using public API)
- [ ] Implement Adzuna extractor (requires API keys, disabled by default)
- [ ] Implement manual URL entry extractor
- [ ] Implement CSV import extractor
- [ ] Create disabled placeholders for LinkedIn, Indeed, Glassdoor
- [ ] Build dedupe pipeline (by URL, sourceId, normalized title+company+location)
- [ ] Build ExtractorRun logging and status tracking
- [ ] Create Jobs page with search form, filters, job cards, detail panel
- [ ] Persist results to database
- [ ] Test with real RemoteOK search

---

## Phase 3: Profile Management
- [ ] Profile page with form fields
- [ ] Resume upload
- [ ] Structured resume JSON editor with Zod validation
- [ ] Save/load profile persistence

---

## Phase 4: Application Tracker
- [ ] Kanban board with drag-and-drop (Saved → Preparing → Applied → Interviewing → Assessment → Offer → Rejected → Withdrawn → Archived)
- [ ] Application detail drawer with timeline
- [ ] "Mark as Applied" prompt (date, resume version, notes, recruiter email, follow-up date)
- [ ] Follow-up tracking (due/overdue)
- [ ] CSV/Excel export

---

## Phase 5: AI Scoring
- [ ] AI provider abstraction (OpenAI, Gemini, OpenRouter, Ollama)
- [ ] Configurable from Settings page
- [ ] Scoring function with exact JSON contract
- [ ] Scoring cache by job+profile+model
- [ ] Wire "Score Job" action into Jobs UI
- [ ] Manual re-score action

---

## Phase 6: CV Tailoring and PDF Export
- [ ] Tailoring function with truth-check validation
- [ ] ATS PDF template rendering
- [ ] Persist tailored JSON, HTML preview, PDF path, reports on ResumeVersion
- [ ] Wire "Tailor CV" into job detail panel with preview and download

---

## Phase 7: Gmail Integration (Optional)
- [ ] Gmail OAuth read-only integration
- [ ] Email classifier (interview_invite, assessment_request, rejection, offer, recruiter_followup, application_confirmation, unrelated, unknown)
- [ ] Link messages to applications
- [ ] ApplicationEvent creation
- [ ] Auto-update status above confidence threshold, flag below for manual review
- [ ] Enforce read-only in code

---

## Phase 8: Polish
- [ ] Settings page (AI provider settings, extractor toggles, search defaults, score thresholds, Gmail settings, data export/import, DB backup)
- [ ] Dashboard metrics (jobs discovered/scored, high-fit jobs, applications by status, follow-ups due, recent activity, top companies, top sources, avg fit score)
- [ ] Full test suite (extractors, dedupe, scoring, tailoring, truth-check, PDF filename, status transitions, timeline events, CSV/Excel import-export, email classifier)
- [ ] README.md covering: what JobOps does/doesn't do, compliance notes, Docker setup, env vars, adding extractors, configuring AI providers, scoring/tailoring/PDF/tracking/Gmail workflows, data export, testing, deployment, troubleshooting

---

## Notes

### Compliance Enforced
- No auto-apply, no auto-submit (verified in code)
- No CAPTCHA bypass, no scraping restrictions (disabled placeholders for LinkedIn, Indeed, Glassdoor)
- Tailored resumes use only facts from base resume (truth-check validation in contract)
- Gmail read-only enforced in code (OAuth scope read-only, no send/delete/modify)

### Tech Stack Confirmed
- Next.js 14 with App Router
- TypeScript with strict mode
- Tailwind CSS for styling
- Prisma ORM with SQLite/PostgreSQL
- Zod for validation
- React Hook Form for forms
- Lucide React for icons

### Database
- 10 models implemented and seeded
- Proper relationships and indexes
- JSON columns for complex data (structuredResumeJson, rawJson, etc.)
- Encryption support for sensitive fields (encrypted flag on Settings)

### Architecture Notes
- src/lib/env.ts validates all required env vars at startup
- src/lib/db.ts handles Prisma client singleton
- src/lib/logger.ts provides structured logging
- src/lib/utils.ts has common formatting and normalization utilities
- All page stubs created for easy Phase 2-8 implementation
