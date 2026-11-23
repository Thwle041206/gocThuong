import type { NextConfig } from "next";

// Static export: `npm run build` writes plain HTML pages to ./out
// that can be hosted anywhere (Firebase Hosting, GitHub Pages, Netlify…).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
