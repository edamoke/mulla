import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint creates the initial admin user
// It should only be called once during setup
export async function POST(request: Request) {
  try {
    const { email, password, setupKey } = await request.json()
    
    // Verify setup key to prevent unauthorized admin creation
    // In production, use a secure environment variable
    const validSetupKey = process.env.ADMIN_SETUP_KEY || 'mulla-admin-setup-2024'
    
    if (setupKey !== validSetupKey) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      )
    }

    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const adminExists = existingUsers?.users?.some(
      u => u.email === email && u.user_metadata?.role === 'admin'
    )

    if (adminExists) {
      return NextResponse.json(
        { error: 'Admin account already exists' },
        { status: 400 }
      )
    }

    // Create the admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Update the profile to set admin role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Don't fail completely - auth user was created
    }

    // Also create a staff record for the admin
    const { error: staffError } = await supabaseAdmin
      .from('staff')
      .insert({
        user_id: authData.user.id,
        employee_id: 'ADMIN-001',
        first_name: 'Admin',
        last_name: 'User',
        email: email,
        role: 'admin',
        department: 'Management'
      })

    if (staffError) {
      console.error('Staff error:', staffError)
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      userId: authData.user.id
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
