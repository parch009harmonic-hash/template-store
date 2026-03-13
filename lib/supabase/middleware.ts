import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export async function updateSession(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  const { pathname, search } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminProtectedApi =
    pathname.startsWith("/api/admin") || pathname === "/api/auth/admin/check";
  const isCustomerProtectedPage = pathname === "/profile" || pathname.startsWith("/lucky-draw");
  const isProtectedApi =
    isAdminProtectedApi ||
    pathname.startsWith("/api/notifications") ||
    pathname.startsWith("/api/lucky-draw");

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
        );
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user && isAdminPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(redirectUrl);
  }

  if (!user && isCustomerProtectedPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/member/login";
    redirectUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(redirectUrl);
  }

  if (!user && isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user && (isAdminPage || isAdminProtectedApi)) {
    const [{ data: adminRowsRaw }, { data: ownerRowsRaw }] = await Promise.all([
      supabase
        .from("admin_users")
        .select("id")
        .eq("profile_id", user.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .limit(1),
      supabase
        .from("restaurants")
        .select("id")
        .eq("owner_profile_id", user.id)
        .is("deleted_at", null)
        .limit(1)
    ]);

    const hasAdminAccess = (adminRowsRaw?.length ?? 0) > 0 || (ownerRowsRaw?.length ?? 0) > 0;

    if (!hasAdminAccess && isAdminPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
      return NextResponse.redirect(redirectUrl);
    }

    if (!hasAdminAccess && isAdminProtectedApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return response;
}
