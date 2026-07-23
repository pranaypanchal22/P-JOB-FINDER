import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Gmail sync coming in Phase 7' },
    { status: 501 }
  )
}
