import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const limit = searchParams.get('limit')
  const page = searchParams.get('page')
  const search = searchParams.get('search')

  const supabase = await createClient()
  const pageNum = page ? parseInt(page) : 1
  const pageSize = limit ? parseInt(limit) : 50
  const offset = (pageNum - 1) * pageSize

  let query = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    // Get category ID from slug
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()

    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`)
  }

  const { data, error, count } = await query.range(offset, offset + pageSize - 1)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    data,
    total: count || 0,
    page: pageNum,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  })
}
