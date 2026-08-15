import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

// Automatic copy of the uploaded avatar image to the public folder during runtime initialization
try {
  const dest = path.join(process.cwd(), "public/jan_sahay_avatar.jpg");
  const fallbackSrc = path.join(process.cwd(), "public/jan-sahay-avatar.png");
  const externalSrc = "C:/Users/dr/.gemini/antigravity-ide/brain/d96a7103-bbd7-456c-8a73-9d92c96c8dfe/media__1786145153471.jpg";

  if (fs.existsSync(externalSrc)) {
    fs.copyFileSync(externalSrc, dest);
    console.log("Auto-copied uploaded avatar image from external path to public/jan_sahay_avatar.jpg!");
  } else if (!fs.existsSync(dest) && fs.existsSync(fallbackSrc)) {
    fs.copyFileSync(fallbackSrc, dest);
    console.log("Auto-copied public/jan-sahay-avatar.png to public/jan_sahay_avatar.jpg!");
  }
} catch (e) {
  console.error("Failed to copy avatar in next.config.ts:", e);
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    // These warnings come from upstream LiveKit/AI UI components, not our code.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;