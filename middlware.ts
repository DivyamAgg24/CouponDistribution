import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    if (path.startsWith("/admin") && path !== "/admin") {
        const session = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });

        // If the user is not authenticated or not an admin, redirect to the admin login page
        if (!session || session.role !== "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
    ],
};