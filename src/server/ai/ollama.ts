import axios from 'axios'
import { z } from 'zod'
import { AIProvider, ScoringInput, JobScore } from './types'
import { getEnv } from '@/lib/env'
import { logger } from '@/lib/logger'

const ScoreSchema = z.object({
  fitScore: z.number().min(0).max(100),
  rationale: z.string(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendation: z.enum(['save', 'apply', 'maybe', 'skip']),
  seniorityFit: z.enum(['too_junior', 'good_fit', 'stretch', 'too_senior']),
  roleCategory: z.enum(['devops', 'sre', 'cloud', 'it_operations', 'project_management', 'software', 'other']),
})

export const ollamaProvider: AIProvider = {
  name: 'Ollama (Local)',
  get configured() {
    return !!getEnv().OLLAMA_BASE_URL
  },
  async scoreJob(input: ScoringInput): Promise<JobScore> {
    const env = getEnv()
    if (!env.OLLAMA_BASE_URL) throw new Error('Ollama base URL not configured')

    const prompt = `
You are a job fit analyzer. Analyze this job opportunity against the candidate's profile and provide a structured scoring.

JOB:
Title: ${input.jobTitle}
Company: ${input.company}
Description: ${input.jobDescription}

CANDIDATE:
${input.profileSummary}

Skills: ${input.userSkills.join(', ')}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "fitScore": <0-100, where 100 is perfect fit>,
  "rationale": "<one sentence explanation>",
  "matchedSkills": [<skills from job description the candidate has>],
  "missingSkills": [<hard requirements from job not in candidate skills>],
  "concerns": [<other concerns about fit>],
  "recommendation": "<save|apply|maybe|skip>",
  "seniorityFit": "<too_junior|good_fit|stretch|too_senior>",
  "roleCategory": "<devops|sre|cloud|it_operations|project_management|software|other>"
}
`

    try {
      const response = await axios.post(
        `${env.OLLAMA_BASE_URL}/api/generate`,
        {
          model: env.OLLAMA_MODEL,
          prompt,
          stream: false,
          temperature: 0.3,
        },
        { timeout: 30000 }
      )

      const content = response.data.response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      const parsed = JSON.parse(jsonMatch[0])
      const validated = ScoreSchema.parse(parsed)

      logger.info(`Ollama scored job: ${input.jobTitle} at ${validated.fitScore}`)
      return validated
    } catch (error) {
      logger.error('Ollama scoring error', error)
      throw error
    }
  },
}
