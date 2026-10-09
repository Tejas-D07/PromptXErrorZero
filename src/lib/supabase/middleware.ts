import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value,  }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value,  }) =>
            supabaseResponse.cookies.set(name, value, )
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Enforce Role-based routing securely on the server
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'student';
    
    // If they hit the root dashboard, redirect to their specific role dashboard
    if (request.nextUrl.pathname === '/dashboard') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role}`
      return NextResponse.redirect(url)
    }

    // Check if they are trying to access another role's dashboard
    if (request.nextUrl.pathname.startsWith(`/dashboard/`) && !request.nextUrl.pathname.startsWith(`/dashboard/${role}`)) {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role}`
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
