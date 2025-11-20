// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Redirect to login if not authenticated at all
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // 2. RESTRICT UNVERIFIED USERS
    // If they try to create a report, vote, or comment
    if (token.role === "unverified") {
      if (
        path.startsWith("/feed/create") || 
        path.includes("/api/reports/create") ||
        path.includes("/api/comments") || 
        path.includes("/api/votes")
      ) {
        // For API requests, return JSON error (handled by Next.js usually, but good to be explicit)
        if (path.startsWith("/api")) {
          return NextResponse.json(
            { message: "You must verify your account to perform this action." },
            { status: 403 }
          );
        }
        // For page visits, redirect to verification page
        return NextResponse.redirect(new URL("/auth/verify-request", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Ensure user is logged in
    },
  }
);

// Define protected routes
export const config = {
  matcher: [
    "/feed/create",     // Posting page
    "/api/reports/create", // Posting API
    "/api/comments/:path*", // Commenting API
    "/api/votes/:path*",    // Voting API
    "/profile/edit",    // Profile editing
  ]
};