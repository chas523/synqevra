import { NextResponse } from "next/server";

export function middleware(req) {
  // const { pathname } = req.nextUrl;
  // if (pathname.startsWith("/dashboard")) {
  //   const hasSession = req.cookies.get("session")?.value;
  //   if (!hasSession) {
  //     const url = new URL("/login", req.url);
  //     url.searchParams.set("next", pathname);
  //     return NextResponse.redirect(url);
  //   }
  // }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
