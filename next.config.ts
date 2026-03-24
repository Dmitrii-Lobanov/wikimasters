import type { NextConfig } from "next";
import { dirname } from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: dirname(__filename),
  }
};

export default nextConfig;
