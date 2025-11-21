import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Protect Admin Routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/feed", req.url));
      }
    }

    // 2. Redirect Unverified Users trying to post/comment
    if (token?.role === "unverified") {
      if (
        path.startsWith("/feed/create") || 
        path.includes("/api/reports/create") ||
        path.includes("/api/comments") || 
        path.includes("/api/votes")
      ) {
        if (path.startsWith("/api")) {
          return NextResponse.json(
            { message: "Verify your account first." },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/auth/verify", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        
        // Public Routes (No Login Required)
        if (
          path === "/" || 
          path.startsWith("/auth") || 
          path.startsWith("/api/auth") ||
          path.startsWith("/_next") || 
          path.startsWith("/favicon.ico") ||
          path.startsWith("/public")
        ) {
          return true;
        }

        // All other routes require a token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};