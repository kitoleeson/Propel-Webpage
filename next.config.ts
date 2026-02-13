import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    const rules = config.module.rules as any[];
    const oneOfRule = rules.find((rule) => Array.isArray(rule.oneOf));
    if(!oneOfRule) return config;
    const assetRule = oneOfRule.oneOf.find((rule: any) => rule.test && rule.test instanceof RegExp && rule.test.test('.svg'));
    if(assetRule) assetRule.exclude = /\.svg$/i;
    oneOfRule.oneOf.unshift({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
