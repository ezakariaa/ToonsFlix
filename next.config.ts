import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(githubPages ? { basePath: "/ToonsFlix" } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: githubPages ? "/ToonsFlix" : "",
  },
};

export default nextConfig;
