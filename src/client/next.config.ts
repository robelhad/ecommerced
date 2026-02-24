import type { NextConfig } from "next";

const nextConfig: NextConfig = {
//  eslint: {
//    ignoreDuringBuilds: true,
 // },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "m.media-amazon.com",
      "www.bestbuy.com",
      "www.dyson.com",
      "store.hp.com",
      "i1.adis.ws",
      "i5.walmartimages.com",
      "lh3.googleusercontent.com",
      "res.cloudinary.com",
      "pbs.twimg.com",
      "store.storeimages.cdn-apple.com",
      "ecommerce-hvqn.onrender.com",
      "192.168.161.140",
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ecommerce-hvqn.onrender.com',
        pathname: '/api/v1/image/**',
      },
    ],
  },
};

export default nextConfig;
