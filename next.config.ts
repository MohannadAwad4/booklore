import type { NextConfig } from "next";

function r2PublicHostPattern() {
  const raw = process.env.R2_PUBLIC_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const protocol = u.protocol === "http:" ? "http" : "https";
    return {
      protocol: protocol as "http" | "https",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/**" as const,
    };
  } catch {
    return null;
  }
}

const r2Pattern = r2PublicHostPattern();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: r2Pattern ? [r2Pattern] : [],
  },
};

export default nextConfig;
