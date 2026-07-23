import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Jobs endpoint coming in Phase 2' },
    { status: 501 }
  )
}
