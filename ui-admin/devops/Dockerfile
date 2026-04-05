# Stage 1: Build
ARG APP_VERSION
FROM node:18 AS build
ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

COPY package*.json ./
RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install

COPY . .

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
ARG APP_VERSION
LABEL org.opencontainers.image.version=$APP_VERSION

COPY --from=build /app/dist/vex /usr/share/nginx/html
COPY nginxconf/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
