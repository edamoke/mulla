import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Helper to load env variables manually from .env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let value = match[2] || ''
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1)
        }
        process.env[key] = value
      }
    })
  }
}

async function run() {
  loadEnv()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing Supabase URL or Key')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const categories = [
    { name: 'Exquisite Jewelry', slug: 'exquisite-jewelry', description: 'Exclusive jewelry collections' },
    { name: 'Fashion', slug: 'fashion', description: 'Curated coastal and luxury fashion apparel' },
    { name: 'Furniture', slug: 'furniture', description: 'Fine handcrafted furniture' },
    { name: 'African Curios & Crafts', slug: 'african-curios-crafts', description: 'Authentic handcrafted curios and crafts' },
    { name: 'Decor', slug: 'decor', description: 'Sophisticated interior and exterior decor' },
    { name: 'Jewelry', slug: 'jewelry', description: 'Elegant gold, silver and beaded jewelry' },
    { name: 'Accessories', slug: 'accessories', description: 'High-end coastal lifestyle accessories' }
  ]

  console.log('Ensuring categories exist in the database...')

  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sort_order: 1,
        is_active: true
      }, { onConflict: 'slug' })
      .select()

    if (error) {
      console.error(`Error upserting category ${cat.name}:`, error)
    } else {
      console.log(`Category "${cat.name}" is verified/created. ID:`, data?.[0]?.id)
    }
  }

  console.log('Verifying products have categories...')
  // Fetch fashion category
  const { data: fashionCat } = await supabase.from('categories').select('id').eq('slug', 'fashion').single()
  const { data: decorCat } = await supabase.from('categories').select('id').eq('slug', 'decor').single()
  
  if (fashionCat) {
    // If we have products, let's make sure they have a valid category
    const { data: products, error: pError } = await supabase.from('products').select('id, category_id, name')
    if (!pError && products) {
      for (const p of products) {
        if (!p.category_id) {
          const defaultCatId = p.name.toLowerCase().includes('jewelry') || p.name.toLowerCase().includes('necklace') || p.name.toLowerCase().includes('earring')
            ? (await supabase.from('categories').select('id').eq('slug', 'jewelry').single()).data?.id || fashionCat.id
            : p.name.toLowerCase().includes('curio') || p.name.toLowerCase().includes('wood') || p.name.toLowerCase().includes('soapstone')
            ? (await supabase.from('categories').select('id').eq('slug', 'african-curios-crafts').single()).data?.id || fashionCat.id
            : fashionCat.id

          console.log(`Setting default category for product "${p.name}"...`)
          await supabase.from('products').update({ category_id: defaultCatId }).eq('id', p.id)
        }
      }
    }
  }

  console.log('Category and Product verification complete!')
}

run()
