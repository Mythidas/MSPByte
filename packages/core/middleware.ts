import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.getUser();
    if (data.user) {
      await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq('id', data.user.id);
    }

    // re-write landing page
    if (error && request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/landing-page';
      return NextResponse.rewrite(url);
    }

    // auth routes
    if (error && !request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // redirect authed users
    if (request.nextUrl.pathname.includes('/auth') && !error) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (
      request.nextUrl.pathname.includes('/sandbox') &&
      data.user?.email !== 'blake@centriserveit.com'
    ) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
