import { NextResponse } from 'next/server'
import { z } from 'zod'
import { scoreJob } from '../../../server/ai/scoring'
import { logger } from '../../../lib/logger'

const ScoringRequestSchema = z.object({
  jobId: z.string().min(1),
  profileId: z.string().min(1),
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  jobDescription: z.string().min(1),
  profileSummary: z.string().min(1),
  userSkills: z.array(z.string()),
  providerName: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = ScoringRequestSchema.parse(body)

    const score = await scoreJob(
      parsed.jobId,
      parsed.profileId,
      parsed.jobDescription,
      parsed.jobTitle,
      parsed.company,
      parsed.profileSummary,
      parsed.userSkills,
      parsed.providerName
    )

    return NextResponse.json({
      success: true,
      score,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Score endpoint error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scoring failed' },
      { status: 500 }
    )
  }
}
