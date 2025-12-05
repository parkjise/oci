# Stage 1: Build
FROM node:20-alpine AS build
LABEL authors="onerp_adm"

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# Translation 파일 생성 (API 데이터가 있으면 사용, 없으면 기본 파일 사용)
RUN if [ -f translations.json ] && [ -s translations.json ]; then \
        node scripts/generate-translations.cjs translations.json && echo "Translation files generated from API data" || echo "Using default translation files"; \
    else \
        echo "Using default translation files"; \
    fi

# 빌드 시 환경 변수는 ARG로 전달받아 사용
ARG VITE_API_BASE_URL
ARG VITE_API_PROXY_TARGET
ARG VITE_ENV
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_PROXY_TARGET=$VITE_API_PROXY_TARGET
ENV VITE_ENV=$VITE_ENV

# 빌드 시 환경변수 확인 로그
RUN echo "🔨 Building for environment: $VITE_ENV" && \
    echo "   API Base URL: $VITE_API_BASE_URL" && \
    echo "   Proxy Target: $VITE_API_PROXY_TARGET"

RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# 타임존 설정
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    apk del tzdata

# 빌드된 파일을 nginx에 복사
COPY --from=build /app/dist /usr/share/nginx/html

# nginx 설정 파일 생성 (SPA 라우팅 지원)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 80 포트 노출
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

