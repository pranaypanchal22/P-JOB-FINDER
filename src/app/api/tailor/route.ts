import { NextResponse } from 'next/server'
import { z } from 'zod'
import { tailorResumeForJob } from '@/server/resume/actions'
import { logger } from '@/lib/logger'

const TailorRequestSchema = z.object({
  profileId: z.string().min(1),
  jobId: z.string().min(1),
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(1),
  desiredSkills: z.array(z.string()),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = TailorRequestSchema.parse(body)

    const result = await tailorResumeForJob(
      parsed.profileId,
      parsed.jobId,
      parsed.jobTitle,
      parsed.jobDescription,
      parsed.desiredSkills
    )

    return NextResponse.json({
      success: true,
      resumeVersionId: result.resumeVersionId,
      changeSummary: result.tailored.changeSummary,
      warnings: result.warnings,
      keywordReport: result.tailored.keywordReport,
      truthCheckReport: result.tailored.truthCheckReport,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Tailor endpoint error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Tailoring failed' },
      { status: 500 }
    )
  }
}
