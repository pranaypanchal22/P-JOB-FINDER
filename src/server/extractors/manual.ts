import { JobExtractor, ExtractedJob } from './types'

export const manualExtractor: JobExtractor = {
  name: 'Manual Entry',
  enabled: true,
  async search(): Promise<ExtractedJob[]> {
    // Manual entry is done via the UI form, not via search
    return []
  },
}

// Validation for manual job entry
export function validateManualJobEntry(data: unknown): data is ExtractedJob {
  const job = data as ExtractedJob
  return !!(
    job &&
    typeof job === 'object' &&
    job.title &&
    job.company &&
    job.url &&
    job.source === 'manual'
  )
}
