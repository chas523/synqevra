import { type NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;

  const isLoggedIn = Boolean(accessToken);

  const publicForGuests = ["/auth/login", "/auth/activate"];

  const alwaysPublic = ["/", "/dashboard/requestedUsers"];

  const isGuestRoute = publicForGuests.some((route) =>
    pathname.startsWith(route)
  );
  const isAlwaysPublic = alwaysPublic.some((route) => pathname === route);

  if (isLoggedIn && isGuestRoute) {
    const dashboardUrl = new URL("/devices", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (!isLoggedIn && !isGuestRoute && !isAlwaysPublic) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};
