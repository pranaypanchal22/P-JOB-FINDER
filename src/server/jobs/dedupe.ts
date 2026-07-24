import { ExtractedJob } from '../../server/extractors/types'
import { normalizeCompanyName, normalizeJobTitle } from '../../lib/utils'

interface DedupeResult {
  unique: ExtractedJob[]
  duplicates: Array<{ job: ExtractedJob; matchedWith: ExtractedJob }>
}

export function dedupeJobs(jobs: ExtractedJob[]): DedupeResult {
  const seen = new Map<string, ExtractedJob>()
  const unique: ExtractedJob[] = []
  const duplicates: Array<{ job: ExtractedJob; matchedWith: ExtractedJob }> = []

  for (const job of jobs) {
    const canonical = getCanonicalKey(job)

    if (seen.has(canonical)) {
      const matchedWith = seen.get(canonical)!
      duplicates.push({ job, matchedWith })
    } else {
      seen.set(canonical, job)
      unique.push(job)
    }
  }

  return { unique, duplicates }
}

function getCanonicalKey(job: ExtractedJob): string {
  // Priority order for deduplication:
  // 1. URL (most reliable)
  // 2. sourceId + source (unique within source)
  // 3. normalized title + company + location (fallback)

  if (job.url) {
    return `url:${normalizeUrl(job.url)}`
  }

  if (job.sourceJobId && job.source) {
    return `source:${job.source}:${job.sourceJobId}`
  }

  const normalizedTitle = normalizeJobTitle(job.title)
  const normalizedCompany = normalizeCompanyName(job.company)
  const normalizedLocation = (job.location || 'remote').toLowerCase().trim()

  return `normalized:${normalizedTitle}|${normalizedCompany}|${normalizedLocation}`
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.toLowerCase().replace(/\/$/, '')
    return `${parsed.hostname}${pathname}`
  } catch {
    return url.toLowerCase()
  }
}
