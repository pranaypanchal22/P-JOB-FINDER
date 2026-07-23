import { NextResponse } from 'next/server'
import { z } from 'zod'
import { runSearchPipeline } from '@/server/jobs/searchPipeline'
import { logger } from '@/lib/logger'

const SearchRequestSchema = z.object({
  query: z.string().min(1, 'Query required'),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  roleTypes: z.array(z.string()).optional(),
  datePosted: z.enum(['any', '24h', '7d', '30d']).optional().default('any'),
  limit: z.number().int().min(1).max(100).optional().default(50),
  profileId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = SearchRequestSchema.parse(body)

    const result = await runSearchPipeline(
      {
        query: parsed.query,
        location: parsed.location,
        remote: parsed.remote,
        roleTypes: parsed.roleTypes,
        datePosted: parsed.datePosted,
        limit: parsed.limit,
      },
      {
        profileId: parsed.profileId || 'unknown',
        recordRun: true,
      }
    )

    return NextResponse.json({
      success: true,
      jobs: result.jobs,
      runId: result.runId,
      stats: result.stats,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Search endpoint error', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
