import { NextResponse } from 'next/server'
import { getCMSData, saveCMSData } from '@/lib/cms-store'

export async function GET() {
  try {
    const cms = getCMSData()
    return NextResponse.json({ success: true, cms })
  } catch (error) {
    console.error('Error fetching CMS settings:', error)
    return NextResponse.json({ error: 'Failed to fetch CMS settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const updated = saveCMSData(body)
    return NextResponse.json({ success: true, cms: updated })
  } catch (error) {
    console.error('Error updating CMS settings:', error)
    return NextResponse.json({ error: 'Failed to update CMS settings' }, { status: 500 })
  }
}
