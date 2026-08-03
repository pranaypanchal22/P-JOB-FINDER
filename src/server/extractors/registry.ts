import { JobExtractor } from './types'
import { remoteOkExtractor } from './remoteok'
import { adzunaExtractor } from './adzuna'
import { manualExtractor } from './manual'
import { csvImportExtractor } from './csvImport'
import { demoExtractor } from './demo'
import { careerjetExtractor } from './careerjet'
import { usajobsExtractor } from './usajobs'
import { angellistExtractor } from './angellist'
import { builtinExtractor } from './builtin'
import { jsearchExtractor } from './jsearch'
import { linkedinExtractor } from './linkedin.placeholder'
import { indeedExtractor } from './indeed.placeholder'
import { glassdoorExtractor } from './glassdoor.placeholder'

export const extractorRegistry: JobExtractor[] = [
  demoExtractor,
  jsearchExtractor,
  remoteOkExtractor,
  adzunaExtractor,
  careerjetExtractor,
  usajobsExtractor,
  angellistExtractor,
  builtinExtractor,
  manualExtractor,
  csvImportExtractor,
  linkedinExtractor,
  indeedExtractor,
  glassdoorExtractor,
]

export function getEnabledExtractors(): JobExtractor[] {
  return extractorRegistry.filter((e) => e.enabled)
}

export function getExtractor(name: string): JobExtractor | undefined {
  return extractorRegistry.find((e) => e.name.toLowerCase() === name.toLowerCase())
}
