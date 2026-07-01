/** @type {import('next').NextConfig} */

// GitHub Pages 배포용 정적 export 설정.
//  - 저장소가 https://github.com/bstars00-rgb/HR-Request-AR 이므로
//    사이트 주소는 https://bstars00-rgb.github.io/HR-Request-AR/ 가 됩니다.
//  - 따라서 production 빌드에서는 basePath 를 /HR-Request-AR 로 지정합니다.
//  - 로컬 개발(next dev)에서는 basePath 없이 localhost:3000 에서 동작합니다.
const isProd = process.env.NODE_ENV === "production";
const repo = "HR-Request-AR";

const nextConfig = {
  reactStrictMode: true,
  output: "export", // 정적 HTML/JS 로 빌드 → out/ 폴더 (GitHub Pages 호스팅)
  trailingSlash: true, // /calendar/ → /calendar/index.html (Pages 라우팅용)
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { unoptimized: true }, // 정적 export 는 이미지 최적화 서버가 없음
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repo}` : "",
  },
};

module.exports = nextConfig;
