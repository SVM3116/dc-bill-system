import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Retrieve user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Protect routes starting with /dashboard or /bills or /school-setup
  const isDashboardRoute = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/bills')
  const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/signup')
  const isSetupRoute = url.pathname.startsWith('/school-setup')

  if (isDashboardRoute && !user) {
    // Redirect to login if accessing protected routes while unauthenticated
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isSetupRoute && !user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Check if school setup is completed
    const { data: school } = await supabase
      .from('schools')
      .select('school_profile_completed')
      .eq('id', user.id)
      .single()

    const setupCompleted = school?.school_profile_completed || false

    if (isAuthRoute) {
      url.pathname = setupCompleted ? '/dashboard' : '/school-setup'
      return NextResponse.redirect(url)
    }

    if (isDashboardRoute && !setupCompleted) {
      url.pathname = '/school-setup'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
