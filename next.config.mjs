import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Commented out for development - uncomment for production static export
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Telegram mini app specific
  // distDir: 'out',
  // assetPrefix: undefined,
};

export default withNextIntl(withPayload(nextConfig));
