import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get('featured')
  const limit = searchParams.get('limit')

  const supabase = await createClient()

  let query = supabase
    .from('apartments')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  if (limit) {
    query = query.limit(parseInt(limit))
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}
