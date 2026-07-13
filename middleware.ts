export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/",
    "/bills/:path*",
    "/cp/:path*",
    "/images/:path*",
    "/demos/:path*",
    "/settings/:path*",
    "/api/bills/:path*",
    "/api/cp/:path*",
    "/api/images/:path*",
  ],
};
