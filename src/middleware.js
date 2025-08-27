import { NextResponse } from "next/server";

export function middleware(req) {
    const { pathname } = req.nextUrl;
    const hasSession = req.cookies.get("session")?.value;

    if (pathname.startsWith("/dashboard") && !hasSession) {
        const url = new URL("/login", req.url);
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    if (pathname === "/login" && hasSession) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (pathname === "/") {
        if (hasSession) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        } else {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/login", "/dashboard/:path*"],
};