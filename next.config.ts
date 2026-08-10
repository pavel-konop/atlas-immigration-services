import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Only exercised when STORAGE_DRIVER=vercel-blob — admin-uploaded images
    // then live at a Blob URL instead of a local /uploads path.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }]
  }
};

export default nextConfig;
