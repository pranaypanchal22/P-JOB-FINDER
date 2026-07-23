import { z } from 'zod'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { openaiProvider } from './openai'
import { ollamaProvider } from './ollama'
import { AIProvider } from './types'

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

const providers: AIProvider[] = [openaiProvider, ollamaProvider]

export function getConfiguredProviders(): AIProvider[] {
  return providers.filter((p) => p.configured)
}

export function getProvider(name: string): AIProvider | undefined {
  return providers.find((p) => p.name === name && p.configured)
}

export async function scoreJob(
  jobId: string,
  profileId: string,
  jobDescription: string,
  jobTitle: string,
  company: string,
  profileSummary: string,
  userSkills: string[],
  providerName?: string
) {
  try {
    // Get provider
    let provider: AIProvider | undefined
    if (providerName) {
      provider = getProvider(providerName)
      if (!provider) throw new Error(`Provider ${providerName} not configured`)
    } else {
      const configured = getConfiguredProviders()
      if (configured.length === 0) throw new Error('No AI providers configured')
      provider = configured[0]
    }

    // Check cache
    const cached = await prisma.jobScore.findFirst({
      where: {
        jobId,
        profileId,
        model: provider.name,
      },
    })

    if (cached) {
      logger.info(`Using cached score for job ${jobId}`)
      return JSON.parse(cached.rawJson)
    }

    // Score
    const score = await provider.scoreJob({
      jobDescription,
      jobTitle,
      company,
      profileSummary,
      userSkills,
    })

    // Validate
    const validated = ScoreSchema.parse(score)

    // Save
    await prisma.jobScore.create({
      data: {
        jobId,
        profileId,
        provider: provider.name,
        model: provider.name,
        fitScore: validated.fitScore,
        rationale: validated.rationale,
        matchedSkills: JSON.stringify(validated.matchedSkills),
        missingSkills: JSON.stringify(validated.missingSkills),
        concerns: JSON.stringify(validated.concerns),
        recommendation: validated.recommendation,
        seniorityFit: validated.seniorityFit,
        roleCategory: validated.roleCategory,
        rawJson: JSON.stringify(validated),
      },
    })

    logger.info(`Scored job ${jobId}: ${validated.fitScore}`)
    return validated
  } catch (error) {
    logger.error('Scoring error', error)
    throw error
  }
}

export async function rescoreJob(
  jobScoreId: string,
  jobId: string,
  jobDescription: string,
  jobTitle: string,
  company: string,
  profileSummary: string,
  userSkills: string[],
  providerName?: string
) {
  try {
    // Get provider
    let provider: AIProvider | undefined
    if (providerName) {
      provider = getProvider(providerName)
      if (!provider) throw new Error(`Provider ${providerName} not configured`)
    } else {
      const configured = getConfiguredProviders()
      if (configured.length === 0) throw new Error('No AI providers configured')
      provider = configured[0]
    }

    // Score
    const score = await provider.scoreJob({
      jobDescription,
      jobTitle,
      company,
      profileSummary,
      userSkills,
    })

    // Validate
    const validated = ScoreSchema.parse(score)

    // Update
    await prisma.jobScore.update({
      where: { id: jobScoreId },
      data: {
        fitScore: validated.fitScore,
        rationale: validated.rationale,
        matchedSkills: JSON.stringify(validated.matchedSkills),
        missingSkills: JSON.stringify(validated.missingSkills),
        concerns: JSON.stringify(validated.concerns),
        recommendation: validated.recommendation,
        seniorityFit: validated.seniorityFit,
        roleCategory: validated.roleCategory,
        rawJson: JSON.stringify(validated),
      },
    })

    logger.info(`Rescored job ${jobId}: ${validated.fitScore}`)
    return validated
  } catch (error) {
    logger.error('Rescoring error', error)
    throw error
  }
}
