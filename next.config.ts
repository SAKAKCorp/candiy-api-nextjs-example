/** @type {import('next').NextConfig} */
const nextConfig = {
  // Amplify에서 서버사이드 기능 활성화
  output: 'standalone', // 중요! 서버 런타임 포함
  
  // 환경변수를 빌드 시점에 정적으로 바인딩
  env: {
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    // 다른 서버 전용 환경변수들도 추가
  },
  
  // 실험적 기능 활성화 (필요시)
  experimental: {
    // Amplify에서 서버 컴포넌트 지원
    appDir: true, // App Router 사용시
  },
  
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig