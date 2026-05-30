import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = await createAdminClient()
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching profile with admin client:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (err) {
    console.error('API Auth Profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
