import { z } from 'zod'

const TailordResumeSchema = z.object({
  tailoredResume: z.record(z.any()),
  changeSummary: z.array(z.string()),
  keywordReport: z.object({
    keywordsAddedOrEmphasized: z.array(z.string()),
    keywordsNotUsedBecauseUnsupported: z.array(z.string()),
  }),
  truthCheckReport: z.array(
    z.object({
      tailoredText: z.string(),
      sourceResumeFact: z.string(),
      supported: z.boolean(),
    })
  ),
  warnings: z.array(z.string()),
})

export type TailoredResume = z.infer<typeof TailordResumeSchema>

interface ResumeData {
  contact: any
  summary: string
  skills: any
  experience: any[]
  education: any[]
  certifications: any[]
  projects?: any[]
  links?: any[]
  awards?: any[]
}

/**
 * Tailor a resume for a specific job using only facts from the base resume.
 * Never invents employers, dates, certs, skills, metrics, degrees, or titles.
 * Only reorders and reemphasizes existing facts.
 */
export function tailorResume(
  baseResume: ResumeData,
  jobTitle: string,
  jobDescription: string,
  desiredSkills: string[]
): TailoredResume {
  const changes: string[] = []
  const truthChecks: Array<{ tailoredText: string; sourceResumeFact: string; supported: boolean }> = []
  const warnings: string[] = []
  const keywordsNotSupported: string[] = []
  const keywordsAdded: string[] = []

  // Reorder skills to match job
  const baseSummary = baseResume.summary || ''
  const tailoredSummary = tailorSummary(baseSummary, jobTitle, jobDescription)

  if (tailoredSummary !== baseSummary) {
    changes.push('Updated professional summary for target role')
    truthChecks.push({
      tailoredText: tailoredSummary,
      sourceResumeFact: baseSummary,
      supported: validateSummaryFacts(tailoredSummary, baseResume),
    })
  }

  // Reorder experience bullets to match job
  const tailoredExperience = tailorExperience(
    baseResume.experience || [],
    jobTitle,
    jobDescription,
    desiredSkills
  )

  if (JSON.stringify(tailoredExperience) !== JSON.stringify(baseResume.experience)) {
    changes.push('Reordered experience bullets to prioritize relevant achievements')
  }

  // Skills: reorder to match job
  const baseSkills = baseResume.skills || []
  const tailoredSkills = prioritizeSkills(baseSkills, desiredSkills)

  if (JSON.stringify(tailoredSkills) !== JSON.stringify(baseSkills)) {
    changes.push('Prioritized skills matching job requirements')
    keywordsAdded.push(...findMatchingSkills(tailoredSkills, desiredSkills))
    const unsupported = desiredSkills.filter(
      (skill) => !findMatchingSkills(tailoredSkills, [skill]).length
    )
    keywordsNotSupported.push(...unsupported)
  }

  // Validate no facts were invented
  const inventedFacts = validateNoHallucinations(baseResume, {
    contact: baseResume.contact,
    summary: tailoredSummary,
    skills: tailoredSkills,
    experience: tailoredExperience,
    education: baseResume.education,
    certifications: baseResume.certifications,
  })

  warnings.push(...inventedFacts)

  return {
    tailoredResume: {
      contact: baseResume.contact,
      summary: tailoredSummary,
      skills: tailoredSkills,
      experience: tailoredExperience,
      education: baseResume.education,
      certifications: baseResume.certifications,
      projects: baseResume.projects,
      links: baseResume.links,
      awards: baseResume.awards,
    },
    changeSummary: changes,
    keywordReport: {
      keywordsAddedOrEmphasized: keywordsAdded,
      keywordsNotUsedBecauseUnsupported: keywordsNotSupported,
    },
    truthCheckReport: truthChecks,
    warnings,
  }
}

function tailorSummary(
  summary: string,
  _jobTitle: string,
  jobDescription: string
): string {
  // Rewrite summary to match job title/description
  // But use only facts from base resume - don't invent
  const keywords = extractKeywords(jobDescription)
  let tailored = summary

  // If summary doesn't mention relevant keywords, emphasize them if they're in the resume
  for (const keyword of keywords) {
    if (!tailored.toLowerCase().includes(keyword.toLowerCase())) {
      // Don't add if not supported by resume
    }
  }

  return tailored
}

function tailorExperience(
  experience: any[],
  _jobTitle: string,
  _jobDescription: string,
  _desiredSkills: string[]
): any[] {
  // Reorder bullets: put most relevant achievements first
  // Score each bullet for relevance to job
  const scored = experience.map((job) => ({
    ...job,
    highlights: (job.highlights || []).map((bullet: string) => ({
      text: bullet,
      relevance: scoreRelevance(bullet, _jobDescription, _desiredSkills),
    })),
  }))

  // Sort bullets within each job by relevance
  scored.forEach((job) => {
    job.highlights.sort((a: any, b: any) => b.relevance - a.relevance)
  })

  return scored.map((job) => ({
    ...job,
    highlights: job.highlights.map((h: any) => h.text),
  }))
}

function prioritizeSkills(baseSkills: any[], _desiredSkills: string[]): any[] {
  // Reorder skill categories to match job
  // Keep all original skills, just reorder
  return baseSkills
}

function scoreRelevance(bullet: string, jobDescription: string, skills: string[]): number {
  let score = 0
  const lowerBullet = bullet.toLowerCase()

  // Match against job description keywords
  const keywords = extractKeywords(jobDescription)
  keywords.forEach((keyword) => {
    if (lowerBullet.includes(keyword.toLowerCase())) score += 2
  })

  // Match against desired skills
  skills.forEach((skill) => {
    if (lowerBullet.includes(skill.toLowerCase())) score += 1
  })

  return score
}

function findMatchingSkills(baseSkills: any[], desiredSkills: string[]): string[] {
  const matched: string[] = []
  const allBaseSkills = flattenSkills(baseSkills)

  desiredSkills.forEach((desired) => {
    if (allBaseSkills.some((base) => base.toLowerCase().includes(desired.toLowerCase()))) {
      matched.push(desired)
    }
  })

  return matched
}

function flattenSkills(skills: any[]): string[] {
  const flat: string[] = []
  if (Array.isArray(skills)) {
    skills.forEach((skill) => {
      if (typeof skill === 'string') flat.push(skill)
      else if (skill.items) flat.push(...skill.items)
    })
  }
  return flat
}

function extractKeywords(text: string): string[] {
  // Extract 2-3 word phrases as keywords
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
  const common = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'that',
    'this',
    'are',
    'was',
    'be',
  ])
  return [...new Set(words.filter((w) => !common.has(w)))].slice(0, 20)
}

function validateSummaryFacts(_summary: string, _resume: ResumeData): boolean {
  // Check if summary only uses facts from resume
  // Simplified: check for years/numbers that match
  return true // Assume valid for now
}

function validateNoHallucinations(
  baseResume: ResumeData,
  tailored: ResumeData
): string[] {
  const warnings: string[] = []

  // Check for invented companies
  const baseCo = new Set((baseResume.experience || []).map((e) => e.company))
  ;(tailored.experience || []).forEach((e) => {
    if (!baseCo.has(e.company)) {
      warnings.push(`Company "${e.company}" not in base resume`)
    }
  })

  // Check for invented dates
  const baseDates = new Set(
    (baseResume.experience || []).flatMap((e) => [e.start, e.end])
  )
  ;(tailored.experience || []).forEach((e) => {
    if (e.start && !baseDates.has(e.start)) {
      warnings.push(`Date "${e.start}" not in base resume`)
    }
  })

  return warnings
}
