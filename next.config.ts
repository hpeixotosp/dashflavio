import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que o ioredis (módulo Node.js nativo) não seja bundled pelo webpack
  // e rode corretamente no ambiente serverless da Vercel
  serverExternalPackages: ["ioredis"],
};

export default nextConfig;
