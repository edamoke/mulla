import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Fallback admin client to override RLS securely on server callbacks
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  }
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received M-Pesa webhook callback:', JSON.stringify(body, null, 2))

    // Parse the standard Daraja M-Pesa STK Push Callback Payload
    // Format usually has: { Body: { stkCallback: { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata: { Item: [...] } } } }
    const stkCallback = body?.Body?.stkCallback
    if (!stkCallback) {
      // Also support standard C2B validation/confirmation format or generic callbacks
      const transactionId = body?.TransID || body?.transaction_id
      const billRefNumber = body?.BillRefNumber || body?.reference_id || body?.account_number
      const amount = body?.TransAmount || body?.amount

      if (transactionId && billRefNumber) {
        return await handleGenericCallback(transactionId, billRefNumber, amount)
      }

      return NextResponse.json(
        { ResultCode: 1, ResultDesc: 'Invalid payload structure' },
        { status: 400 }
      )
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback

    // ResultCode 0 means payment was successful
    if (ResultCode !== 0) {
      console.warn(`M-Pesa payment failed with description: ${ResultDesc} (Code: ${ResultCode})`)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Failure acknowledged' })
    }

    // Extract transaction metadata
    let mpesaReceiptNumber = ''
    let amountPaid = 0
    let phoneNumber = ''

    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value
        if (item.Name === 'Amount') amountPaid = Number(item.Value)
        if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value)
      }
    }

    console.log(`Verified M-Pesa Payment: Receipt=${mpesaReceiptNumber}, Amount=${amountPaid}, Phone=${phoneNumber}, CheckoutID=${CheckoutRequestID}`)

    const supabase = getAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: 'Database connectivity error' },
        { status: 500 }
      )
    }

    // Identify which record this checkout request matches
    // 1. Check orders
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total')
      .eq('payment_reference', CheckoutRequestID)
      .maybeSingle()

    if (order) {
      console.log(`Updating order ID ${order.id} status to paid via M-Pesa callback.`)
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          payment_reference: mpesaReceiptNumber || CheckoutRequestID
        })
        .eq('id', order.id)

      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Order payment processed' })
    }

    // 2. Check apartment bookings
    const { data: booking } = await supabase
      .from('apartment_bookings')
      .select('id')
      .eq('payment_reference', CheckoutRequestID)
      .maybeSingle()

    if (booking) {
      console.log(`Updating apartment booking ID ${booking.id} to confirmed/paid via M-Pesa callback.`)
      await supabase
        .from('apartment_bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          payment_reference: mpesaReceiptNumber || CheckoutRequestID
        })
        .eq('id', booking.id)

      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Booking payment processed' })
    }

    // 3. Check long-term rent payments
    const { data: rentPayment } = await supabase
      .from('rent_payments')
      .select('id, total_due, amount_paid')
      .eq('payment_number', CheckoutRequestID) // can be matched via checkout reference or generic identifier
      .maybeSingle()

    if (rentPayment) {
      const newAmountPaid = (rentPayment.amount_paid || 0) + (amountPaid || rentPayment.total_due)
      const newBalance = Math.max(0, rentPayment.total_due - newAmountPaid)
      const newStatus = newBalance <= 0 ? 'paid' : 'partial'

      console.log(`Updating rent payment ID ${rentPayment.id} balance to ${newBalance} via M-Pesa callback.`)
      await supabase
        .from('rent_payments')
        .update({
          amount_paid: newAmountPaid,
          balance: newBalance,
          payment_method: 'mpesa',
          payment_date: new Date().toISOString().split('T')[0],
          status: newStatus,
          payment_reference: mpesaReceiptNumber || CheckoutRequestID
        })
        .eq('id', rentPayment.id)

      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Rent payment processed' })
    }

    console.warn(`No match found in orders, bookings, or rent payments for CheckoutRequestID: ${CheckoutRequestID}`)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Acknowledged, no matching record found' })

  } catch (error: any) {
    console.error('M-Pesa Webhook processing error:', error)
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: `Internal Server Error: ${error?.message || 'unknown'}` },
      { status: 500 }
    )
  }
}

async function handleGenericCallback(transactionId: string, reference: string, amount: number) {
  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Database client failure' }, { status: 500 })
  }

  // Look up by reference across tables
  // Orders check
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', reference)
    .maybeSingle()

  if (order) {
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        payment_reference: transactionId
      })
      .eq('id', order.id)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Generic confirmation processed for order' })
  }

  // Booking check
  const { data: booking } = await supabase
    .from('apartment_bookings')
    .select('id')
    .eq('booking_number', reference)
    .maybeSingle()

  if (booking) {
    await supabase
      .from('apartment_bookings')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        payment_reference: transactionId
      })
      .eq('id', booking.id)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Generic confirmation processed for booking' })
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: 'Acknowledged generic payment, matching reference not found' })
}
