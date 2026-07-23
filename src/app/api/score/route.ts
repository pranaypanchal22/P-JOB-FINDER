import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Scoring endpoint coming in Phase 5' },
    { status: 501 }
  )
}
