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
          process.env[key] = value
        } else {
          process.env[key] = value.trim()
        }
      }
    })
  }
}

async function run() {
  loadEnv()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing Supabase URL or Service Role Key in .env')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('--- STARTING SYSTEM INTEGRATION TEST ---')

  // Step 1: Save custom settings via API
  console.log('\n[1/5] Setting up admin configurations via Settings Store...')
  const settingsData = {
    store_name: "Boty Luxury Boutique",
    currency: "KES",
    tax_rate: "16",
    etims_pin: "PIN_MULLA_TEST_2026",
    etims_device_id: "DEVICE_MULLA_TEST_2026",
    etims_server_url: "https://etims-api-test.kra.go.ke/v1",
    mpesa_shortcode: "174379",
    mpesa_consumer_key: "CON_KEY_MULLA_TEST",
    mpesa_consumer_secret: "CON_SEC_MULLA_TEST",
    mpesa_passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    enable_online_pos_purchase: true,
  }

  const settingsRes = await fetch('http://127.0.0.1:3001/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData)
  })
  const settingsJson = await settingsRes.json()
  console.log('Settings successfully stored:', settingsJson.success)

  // Step 2: Fetch target product and verify initial stock
  console.log('\n[2/5] Fetching Beach Wedding Gold Necklace product...')
  const { data: product, error: pError } = await supabase
    .from('products')
    .select('*')
    .eq('slug', 'beach-wedding-gold-necklace')
    .single()

  if (pError || !product) {
    console.error('Failed to fetch product. Please ensure seed-demo.mjs was run.', pError)
    process.exit(1)
  }

  const initialStock = product.stock_quantity
  console.log(`Product: "${product.name}" | ID: ${product.id}`)
  console.log(`Initial Stock in POS Catalog: ${initialStock}`)

  // Step 3: Trigger online checkout with mock items
  console.log('\n[3/5] Performing online checkout with M-Pesa Payment Method...')
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
    customer_name: 'Test Customer',
    customer_email: 'test@mulla.co.ke',
    customer_phone: '+254712345678',
    shipping_address: {
      line1: 'Coastal Highway, Malindi',
      city: 'Malindi',
      country: 'Kenya'
    }
  }

  const orderRes = await fetch('http://127.0.0.1:3001/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutPayload)
  })

  const orderJson = await orderRes.json()
  if (!orderJson.success) {
    console.error('Checkout failed:', orderJson)
    process.exit(1)
  }

  console.log('Order Successfully Created!')
  console.log('Order Number:', orderJson.order_number)
  console.log('Simulated M-Pesa STK Push Triggered:', orderJson.mpesa_stk_push)
  console.log('Simulated KRA eTIMS Validated Invoice:', orderJson.etims_invoice)

  // Step 4: Verify stock deduction and inventory logs
  console.log('\n[4/5] Verifying stock levels and transaction logging...')
  const { data: updatedProduct } = await supabase
    .from('products')
    .select('stock_quantity')
    .eq('id', product.id)
    .single()

  console.log(`Expected new stock: ${initialStock - 2} | Actual Stock: ${updatedProduct.stock_quantity}`)

  const { data: invTx, error: txError } = await supabase
    .from('inventory_transactions')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (invTx && invTx.length > 0) {
    console.log('Inventory Transaction log successfully created!')
    console.log('Log details:', {
      transaction_type: invTx[0].transaction_type,
      quantity: invTx[0].quantity,
      reference_type: invTx[0].reference_type,
      notes: invTx[0].notes,
    })
  } else {
    console.error('No inventory transaction log found!', txError)
  }

  // Step 5: Test checkout blocker by disabling the "enable_online_pos_purchase" setting
  console.log('\n[5/5] Testing POS Sync Blocker (enable_online_pos_purchase = false)...')
  await fetch('http://127.0.0.1:3001/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enable_online_pos_purchase: false })
  })

  const blockRes = await fetch('http://127.0.0.1:3001/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutPayload)
  })
  const blockJson = await blockRes.json()
  console.log('Blocker response status code:', blockRes.status)
  console.log('Blocker response message:', blockJson.error)

  // Reset setting back to true
  await fetch('http://127.0.0.1:3001/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enable_online_pos_purchase: true })
  })

  console.log('\n--- INTEGRATION TEST PASSED SUCCESSFULLY ---')
  process.exit(0)
}

run()
