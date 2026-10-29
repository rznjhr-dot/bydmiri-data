import type { NextConfig } from "next";
import { JPJ_PROXY_PATH, JPJ_URL } from "./src/config/jpj";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Dev-only fallback: fetch the raw JPJ page locally so the board works without
  // Netlify. Production serves sanitized JSON from netlify/functions/jpj-plates.ts.
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: JPJ_PROXY_PATH,
              destination: JPJ_URL,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
