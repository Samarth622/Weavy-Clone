import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/workflows/:path*",
    "/api/run-workflow/:path*",
    "/api/run-status/:path*",
  ],
};
