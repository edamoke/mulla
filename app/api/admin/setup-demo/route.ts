import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Create cleaner user account if not exists
    const cleanerEmail = 'cleaner@mulla.co.ke'
    const cleanerPassword = 'MullaCleaner2026!'
    
    let cleanerId = ''
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const cleanerUser = existingUsers?.users?.find(u => u.email === cleanerEmail)

    if (!cleanerUser) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanerEmail,
        password: cleanerPassword,
        email_confirm: true,
        user_metadata: {
          first_name: 'Jane',
          last_name: 'Cleaner',
          role: 'staff'
        }
      })
      if (authError) throw authError
      cleanerId = authData.user.id
    } else {
      cleanerId = cleanerUser.id
    }

    // Upsert cleaner profile and staff record
    await supabaseAdmin.from('profiles').upsert({
      id: cleanerId,
      email: cleanerEmail,
      first_name: 'Jane',
      last_name: 'Cleaner',
      role: 'staff'
    })

    const { data: existingStaff } = await supabaseAdmin
      .from('staff')
      .select('id')
      .eq('user_id', cleanerId)
      .maybeSingle()

    let staffId = existingStaff?.id
    if (!existingStaff) {
      const { data: newStaff, error: staffError } = await supabaseAdmin.from('staff').insert({
        user_id: cleanerId,
        employee_id: 'CLN-002',
        first_name: 'Jane',
        last_name: 'Cleaner',
        email: cleanerEmail,
        role: 'cleaner',
        department: 'Housekeeping',
        is_active: true
      }).select().single()
      if (staffError) throw staffError
      staffId = newStaff.id
    }

    // 2. Create demo long-term tenant account
    const tenantEmail = 'tenant-longterm@mulla.co.ke'
    const tenantPassword = 'MullaTenant2026!'
    let tenantId = ''
    const tenantUser = existingUsers?.users?.find(u => u.email === tenantEmail)

    if (!tenantUser) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: tenantEmail,
        password: tenantPassword,
        email_confirm: true,
        user_metadata: {
          first_name: 'John',
          last_name: 'Renter',
          role: 'customer'
        }
      })
      if (authError) throw authError
      tenantId = authData.user.id
    } else {
      tenantId = tenantUser.id
    }

    await supabaseAdmin.from('profiles').upsert({
      id: tenantId,
      email: tenantEmail,
      first_name: 'John',
      last_name: 'Renter',
      role: 'customer'
    })

    // 3. Create demo short-term guest account
    const guestEmail = 'booking-shortterm@mulla.co.ke'
    const guestPassword = 'MullaGuest2026!'
    let guestId = ''
    const guestUser = existingUsers?.users?.find(u => u.email === guestEmail)

    if (!guestUser) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: guestEmail,
        password: guestPassword,
        email_confirm: true,
        user_metadata: {
          first_name: 'Alice',
          last_name: 'Guest',
          role: 'customer'
        }
      })
      if (authError) throw authError
      guestId = authData.user.id
    } else {
      guestId = guestUser.id
    }

    await supabaseAdmin.from('profiles').upsert({
      id: guestId,
      email: guestEmail,
      first_name: 'Alice',
      last_name: 'Guest',
      role: 'customer'
    })

    // 4. Seed categories and products to show up in POS and Storefront
    const { data: category } = await supabaseAdmin.from('categories').upsert({
      name: 'Exquisite Jewelry',
      slug: 'exquisite-jewelry',
      description: 'Exclusive gold-plated and diamond accessories',
      sort_order: 1,
      is_active: true
    }).select().single()

    const productsToSeed: any[] = [
      {
        name: 'Beach Wedding Gold Necklace',
        slug: 'beach-wedding-gold-necklace',
        short_description: 'Premium gold-plated necklace, highly curated.',
        price: 24500,
        sku: 'GLD-WED-001',
        category_id: category?.id,
        stock_quantity: 50,
        track_inventory: true,
        is_active: true,
        badge: 'bestseller'
      },
      {
        name: 'Malindi Coastal Diamond Ring',
        slug: 'malindi-coastal-diamond-ring',
        short_description: 'Exclusive coastal diamonds set in silver.',
        price: 89000,
        sku: 'DIA-COAST-002',
        category_id: category?.id,
        stock_quantity: 15,
        track_inventory: true,
        is_active: true,
        badge: 'limited'
      },
      {
        name: 'Bespoke Swahili Gold Bangles',
        slug: 'bespoke-swahili-gold-bangles',
        short_description: 'Exquisitely carved gold bangles celebrating rich coastal heritage.',
        price: 34000,
        sku: 'SWA-GLD-003',
        category_id: category?.id,
        stock_quantity: 30,
        track_inventory: true,
        is_active: true,
        badge: 'new'
      },
      {
        name: 'Malindi Pearl Drop Earrings',
        slug: 'malindi-pearl-drop-earrings',
        short_description: 'Lustrous ocean-harvested pearls suspended on 18k gold hooks.',
        price: 18500,
        sku: 'PRL-DRP-004',
        category_id: category?.id,
        stock_quantity: 25,
        track_inventory: true,
        is_active: true,
        badge: 'bestseller'
      },
      {
        name: 'Handcrafted Coastal Choker',
        slug: 'handcrafted-coastal-choker',
        short_description: 'Intricately beaded silver choker matching sea waves motifs.',
        price: 15000,
        sku: 'CST-CHK-005',
        category_id: category?.id,
        stock_quantity: 40,
        track_inventory: true,
        is_active: true,
        badge: 'new'
      },
      {
        name: 'Luxury Brass Anklet',
        slug: 'luxury-brass-anklet',
        short_description: 'Artisan-crafted premium brass anklet with small musical bells.',
        price: 9500,
        sku: 'BRS-ANK-006',
        category_id: category?.id,
        stock_quantity: 60,
        track_inventory: true,
        is_active: true,
        badge: null
      },
      {
        name: 'Royal Emerald Tiara',
        slug: 'royal-emerald-tiara',
        short_description: 'A masterpiece tiara embellished with green emeralds and crystals.',
        price: 145000,
        sku: 'EMR-TIA-007',
        category_id: category?.id,
        stock_quantity: 5,
        track_inventory: true,
        is_active: true,
        badge: 'limited'
      }
    ]

    for (const p of productsToSeed) {
      await supabaseAdmin.from('products').upsert(p, { onConflict: 'slug' })
    }

    // 5. Seed some apartments and bookings
    
    // 1-Bedroom Apartment
    const { data: apt1 } = await supabaseAdmin.from('apartments').upsert({
      name: 'Mulla Furnished 1-Bedroom Coastal Haven',
      slug: 'mulla-furnished-1-bedroom-coastal-haven',
      short_description: 'Elegant fully furnished 1-bedroom apartment in Malindi, perfect for short or long-term beachside living.',
      description: 'Welcome to this boutique, fully furnished 1-bedroom sanctuary. Situated moments away from the pristine Malindi beach, it offers a perfect blend of convenience, comfort, and luxury. Designed with modern coastal decor, high-end imported furniture, and premium accessories, it features a spacious living room, a fully equipped open-plan kitchen, a cozy queen-sized bedroom, and a modern bathroom. Excellent for both quick weekend getaways and extended long-term stays.',
      price_per_night: 8000,
      price_per_week: 50000,
      price_per_month: 95000,
      cleaning_fee: 1500,
      bedrooms: 1,
      bathrooms: 1,
      max_guests: 2,
      location: 'Malindi, Kenya',
      address: 'Beach Road, Malindi',
      city: 'Malindi',
      amenities: ['Fully Furnished', 'Wi-Fi', 'AC', 'Beach Access', 'Equipped Kitchen', 'Smart TV'],
      is_active: true,
      is_featured: true,
      thumbnail_url: '/placeholder.jpg'
    }, { onConflict: 'slug' }).select().single()

    // 2-Bedroom Apartment
    const { data: apt2 } = await supabaseAdmin.from('apartments').upsert({
      name: 'Mulla Furnished 2-Bedroom Oceanfront Suite',
      slug: 'mulla-furnished-2-bedroom-oceanfront-suite',
      short_description: 'Stunning fully furnished 2-bedroom suite offering exquisite comfort, daily housekeeping, and premium amenities.',
      description: 'Experience premium coastal living in our fully furnished 2-bedroom luxury suite. Elegantly appointed with handcrafted imported furniture, customized lighting, and bespoke decor. This suite provides a scenic master bedroom with en-suite facilities, a spacious second bedroom, and an expansive ocean-view balcony. Features a modern fitted kitchen and elegant dining area. Available for daily short-term bookings and flexible long-term monthly rental.',
      price_per_night: 13000,
      price_per_week: 80000,
      price_per_month: 145000,
      cleaning_fee: 2000,
      bedrooms: 2,
      bathrooms: 2,
      max_guests: 4,
      location: 'Malindi, Kenya',
      address: 'Beach Road, Malindi',
      city: 'Malindi',
      amenities: ['Fully Furnished', 'Ocean View', 'Wi-Fi', 'AC', 'Pool Access', 'Equipped Kitchen', 'Security'],
      is_active: true,
      is_featured: true,
      thumbnail_url: '/placeholder.jpg'
    }, { onConflict: 'slug' }).select().single()

    // 3-Bedroom Apartment (Malindi Beachfront Villa)
    const { data: apt } = await supabaseAdmin.from('apartments').upsert({
      name: 'Mulla Furnished 3-Bedroom Executive Penthouse',
      slug: 'mulla-furnished-3-bedroom-executive-penthouse',
      short_description: 'Ultra-luxury fully furnished 3-bedroom beachfront penthouse, optimized for family or group short-term and long-term stays.',
      description: 'A majestic fully furnished 3-bedroom executive penthouse boasting panoramic vistas of the Malindi coastline. This premium residence features double-volume ceilings, bespoke Italian furniture, spacious lounge, full master suite with custom walk-in closet, and two beautifully-designed guest rooms. Equipped with premium household appliances, smart entertainment systems, and a private hot tub. Ideal for families and executive groups seeking elite long-term residency or ultra-luxurious short-term stays.',
      price_per_night: 20000,
      price_per_week: 120000,
      price_per_month: 220000,
      cleaning_fee: 3000,
      bedrooms: 3,
      bathrooms: 3,
      max_guests: 6,
      location: 'Malindi, Kenya',
      address: 'Beach Road, Malindi',
      city: 'Malindi',
      amenities: ['Fully Furnished', 'Ocean View', 'Private Jacuzzi', 'Wi-Fi', 'AC', 'Pool', 'Elevator', 'Gym'],
      is_active: true,
      is_featured: true,
      thumbnail_url: '/placeholder.jpg'
    }, { onConflict: 'slug' }).select().single()

    if (apt) {
      // Create short-term 2 week stay booking
      const checkInDate = new Date()
      checkInDate.setDate(checkInDate.getDate() + 2)
      const checkOutDate = new Date()
      checkOutDate.setDate(checkOutDate.getDate() + 16) // 14 nights (2 weeks)

      const accommodationTotal = 20000 * 14
      const serviceFee = accommodationTotal * 0.05
      const cleaningFee = 3000
      const total = accommodationTotal + cleaningFee + serviceFee

      await supabaseAdmin.from('apartment_bookings').upsert({
        booking_number: `BKG-ST-${Date.now()}`,
        apartment_id: apt.id,
        user_id: guestId,
        check_in_date: checkInDate.toISOString().split('T')[0],
        check_out_date: checkOutDate.toISOString().split('T')[0],
        nights: 14,
        guests: 2,
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'mpesa',
        accommodation_total: accommodationTotal,
        cleaning_fee: cleaningFee,
        service_fee: serviceFee,
        total: total,
        currency: 'KES',
        guest_name: 'Alice Guest',
        guest_email: guestEmail,
        guest_phone: '+254711223344',
        special_requests: 'Require airport pickup from Malindi Airport.',
        internal_notes: 'SHORT-TERM STAY AGREEMENT: Standard coastal short-term terms apply. Full guest access is granted.'
      }, { onConflict: 'booking_number' })

      // Create long-term tenant rent payment representing lease agreement
      const leaseStart = new Date()
      leaseStart.setDate(leaseStart.getDate() - 5)
      const leaseEnd = new Date()
      leaseEnd.setDate(leaseEnd.getDate() + 25)

      await supabaseAdmin.from('rent_payments').upsert({
        payment_number: `RENT-LT-${Date.now()}`,
        apartment_id: apt.id,
        tenant_name: 'John Renter',
        period_start: leaseStart.toISOString().split('T')[0],
        period_end: leaseEnd.toISOString().split('T')[0],
        rent_amount: 150000,
        utilities_amount: 12000,
        other_charges: 3000,
        total_due: 165000,
        amount_paid: 165000,
        balance: 0,
        due_date: leaseStart.toISOString().split('T')[0],
        status: 'paid',
        payment_method: 'bank',
        payment_date: leaseStart.toISOString().split('T')[0],
        created_at: leaseStart.toISOString()
      }, { onConflict: 'payment_number' })

      // 6. Create historical cleaning logs for Cleaner
      await supabaseAdmin.from('cleaning_logs').insert({
        log_number: `CLN-101`,
        apartment_id: apt.id,
        cleaner_id: staffId,
        cleaning_type: 'regular',
        clock_in: new Date(Date.now() - 3 * 3600000).toISOString(),
        clock_out: new Date(Date.now() - 2 * 3600000).toISOString(),
        duration_minutes: 60,
        status: 'completed',
        tasks_completed: [
          'Vacuum all floors',
          'Clean shower/bathtub',
          'Wipe kitchen counters'
        ],
        notes: 'Ocean Front Villa was thoroughly cleaned and prepared. All linens changed.'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Demo accounts, checklists, cleaning logs, lease agreements, products, and bookings created successfully!',
      cleaner: { email: cleanerEmail, password: cleanerPassword },
      longTermTenant: { email: tenantEmail, password: tenantPassword },
      shortTermGuest: { email: guestEmail, password: guestPassword }
    })

  } catch (error: any) {
    console.error('Demo setup error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
