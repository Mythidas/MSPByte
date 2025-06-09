import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://partners.sophos.com/favicon.png'),
      new URL('https://assets.sophos.com/X24WTUEQ/at/h5mf9xfw94jv5mmjpzmmbr/sophos-logo-white.svg')
    ]
  }
};

export default nextConfig;
