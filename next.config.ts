import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The API stores every upload (user photos, officer photos, contractor
    // photos, institution logos) on Cloudinary — next/image refuses to
    // optimize an external host unless it's explicitly allowed here.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
