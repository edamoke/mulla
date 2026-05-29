import { NextResponse } from 'next/server'
import { getAdminSettings, saveAdminSettings } from '@/lib/settings-store'

export async function GET() {
  try {
    const settings = getAdminSettings()
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const updated = saveAdminSettings(body)
    return NextResponse.json({ success: true, settings: updated })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
