import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Tailoring endpoint coming in Phase 6' },
    { status: 501 }
  )
}
