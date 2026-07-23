import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Export endpoint coming in Phase 4' },
    { status: 501 }
  )
}
