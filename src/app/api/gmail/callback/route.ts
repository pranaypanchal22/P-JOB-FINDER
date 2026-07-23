import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Gmail OAuth callback coming in Phase 7' },
    { status: 501 }
  )
}
