import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    const imageRule = config.module.rules.find((rule: any) => rule?.test?.test?.(".svg"));
    if (imageRule) imageRule.exclude = /\.svg$/i;
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [{
        loader: "@svgr/webpack",
        options: {
          prettier: false,
          svgo: true,
          svgoConfig: { plugins: [ { name: "removeViewBox", active: false }, ], },
          titleProp: true,
        },
      },],
    });
    return config;
  },
};

export default nextConfig;
