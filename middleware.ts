export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/",
    "/bills/:path*",
    "/clipboard/:path*",
    "/images/:path*",
    "/demos/:path*",
    "/settings/:path*",
    "/api/bills/:path*",
    "/api/clipboard/:path*",
    "/api/images/:path*",
  ],
};
