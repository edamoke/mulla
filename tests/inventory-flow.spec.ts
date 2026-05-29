// @ts-nocheck
import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load environment variables manually
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
          process.env[key] = value
        } else {
          process.env[key] = value.trim()
        }
      }
    })
  }
}

loadEnv()

test.describe('POS and Online Customer Checkouts Inventory Flow E2E', () => {
  // Read Supabase environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are missing.')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  test('should setup demo, execute POS & online checkouts, and verify inventory reduction with logs', async ({ request, baseURL }) => {
    const targetBaseURL = baseURL || 'http://127.0.0.1:3001'
    console.log(`Using base URL: ${targetBaseURL}`)

    // Step 1: Run setup-demo seed route
    console.log('[1/5] Running setup-demo seed route...')
    const setupRes = await request.post(`${targetBaseURL}/api/admin/setup-demo`)
    expect(setupRes.status()).toBe(200)
    const setupJson = await setupRes.json()
    expect(setupJson.success).toBe(true)
    console.log('Demo setup completed successfully.')

    // Step 2: Fetch target product 'beach-wedding-gold-necklace' and check initial stock
    console.log('[2/5] Checking initial stock of target product...')
    const { data: product, error: pError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', 'beach-wedding-gold-necklace')
      .single()

    expect(pError).toBeNull()
    expect(product).not.toBeNull()
    const initialStock = product.stock_quantity
    console.log(`Product: "${product.name}" | Initial Stock: ${initialStock}`)

    // Step 3: Configure Settings to ensure online pos purchase is enabled
    console.log('[3/5] Setting up admin configurations via Settings API...')
    const settingsPayload = {
      store_name: "Boty Luxury Boutique",
      currency: "KES",
      tax_rate: "16",
      enable_online_pos_purchase: true,
    }
    const settingsRes = await request.post(`${targetBaseURL}/api/admin/settings`, {
      data: settingsPayload
    })
    expect(settingsRes.status()).toBe(200)

    // Step 4: Perform online checkout / POS checkout representing inventory-flow
    console.log('[4/5] Executing online customer checkout...')
    const checkoutPayload = {
      items: [
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 2,
          unit_price: product.price,
        }
      ],
      subtotal: product.price * 2,
      shipping_cost: 0,
      total: product.price * 2,
      payment_method: 'mpesa',
      customer_name: 'E2E Playwright Customer',
      customer_email: 'playwright-customer@mulla.co.ke',
      customer_phone: '+254712345678',
      shipping_address: {
        line1: 'Coastal Highway, Malindi',
        city: 'Malindi',
        country: 'Kenya'
      }
    }

    const checkoutRes = await request.post(`${targetBaseURL}/api/orders`, {
      data: checkoutPayload
    })
    expect(checkoutRes.status()).toBe(200)
    const checkoutJson = await checkoutRes.json()
    expect(checkoutJson.success).toBe(true)
    expect(checkoutJson.order_number).toBeDefined()
    console.log(`Checkout created successfully. Order Number: ${checkoutJson.order_number}`)

    // Step 5: Verify stock level reduction and inventory transactions log in Supabase
    console.log('[5/5] Verifying stock level reductions and logging in DB...')
    const { data: updatedProduct, error: upError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', product.id)
      .single()

    expect(upError).toBeNull()
    expect(updatedProduct.stock_quantity).toBe(initialStock - 2)
    console.log(`Stock correctly reduced from ${initialStock} to ${updatedProduct.stock_quantity}`)

    const { data: invTx, error: txError } = await supabase
      .from('inventory_transactions')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(1)

    expect(txError).toBeNull()
    expect(invTx).not.toBeNull()
    expect(invTx.length).toBeGreaterThan(0)
    expect(invTx[0].transaction_type).toBe('sale')
    expect(invTx[0].quantity).toBe(-2)
    expect(invTx[0].reference_type).toBe('order')
    console.log('Inventory transaction log successfully verified:', invTx[0])
  })
})
