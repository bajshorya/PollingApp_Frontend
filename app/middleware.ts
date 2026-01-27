import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const protectedPaths = ["/polls", "/create-new-poll"];

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtected) {
    const sessionCookie = request.cookies.get("webauthnrs");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/polls/:path*", "/create-new-poll/:path*"],
};
