import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * A Content-Security-Policy is deliberately not set here: Next injects inline
 * bootstrap scripts, so a useful policy needs per-request nonces via
 * middleware, which is a larger change than this pass. The headers below are
 * the ones that are safe to apply unconditionally. Strict-Transport-Security is
 * already set by the hosting platform.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Do not advertise the framework version.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
