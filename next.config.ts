import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
