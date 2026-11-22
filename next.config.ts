import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stops `next dev` appending its managed rules block to AGENTS.md when an AI
  // agent starts the dev server.
  agentRules: false,
  experimental: {
    agentUpgrade: "security",
  },
  // AVIF first: for the photo and the Work diagrams it is typically 30-50%
  // smaller than WebP at the same quality. Browsers without it get WebP.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Safe only because every model URL carries a /vN/ segment: shard
        // names are not content-hashed, and model.json / word_index*.json are
        // stable names, so a re-export must land in a new versioned directory
        // rather than overwriting these files in place. See lib/lab-models.ts.
        source: "/models/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
