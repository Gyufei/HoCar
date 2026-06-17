export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/",
    "/bills/:path*",
    "/images/:path*",
    "/demos/:path*",
    "/settings/:path*",
    "/api/bills/:path*",
  ],
};
