import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'db.xrmvmpbxrtldgpjtyklq.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 필요한 경우 여기에 추가 설정을 넣습니다.
};

export default nextConfig;
