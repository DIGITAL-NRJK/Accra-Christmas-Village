import type { NextConfig } from "next";

type ServerActionsConfig = NonNullable<NonNullable<NextConfig["experimental"]>["serverActions"]>;

const documentUploadBodySizeLimit = (
  process.env.DOCUMENT_UPLOAD_BODY_SIZE_LIMIT ?? "12mb"
) as ServerActionsConfig["bodySizeLimit"];

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: documentUploadBodySizeLimit,
    },
  },
};

export default nextConfig;
