# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN --mount=type=secret,id=npm_token,required=true \
    npm config set --location=user '//npm.pkg.github.com/:_authToken' "$(cat /run/secrets/npm_token)" && \
    npm ci && \
    rm -f /root/.npmrc

COPY . .

ARG VITE_OPERATION_REMOTE_URL
ARG VITE_COMMERCIAL_REMOTE_URL
ARG VITE_MANAGEMENT_REMOTE_URL
ARG VITE_PLATFORM_REMOTE_URL
ARG VITE_LABEL_PRINT_MODE=auto
ARG VITE_ZEBRA_BROWSER_PRINT_SCRIPT=/vendor/BrowserPrint.min.js
ARG VITE_ZEBRA_DPI=203
ARG VITE_API_URL
ARG VITE_OIDC_AUTHORITY
ARG VITE_OIDC_CLIENT_ID=ts-host

ENV VITE_OPERATION_REMOTE_URL=$VITE_OPERATION_REMOTE_URL \
    VITE_COMMERCIAL_REMOTE_URL=$VITE_COMMERCIAL_REMOTE_URL \
    VITE_MANAGEMENT_REMOTE_URL=$VITE_MANAGEMENT_REMOTE_URL \
    VITE_PLATFORM_REMOTE_URL=$VITE_PLATFORM_REMOTE_URL \
    VITE_LABEL_PRINT_MODE=$VITE_LABEL_PRINT_MODE \
    VITE_ZEBRA_BROWSER_PRINT_SCRIPT=$VITE_ZEBRA_BROWSER_PRINT_SCRIPT \
    VITE_ZEBRA_DPI=$VITE_ZEBRA_DPI \
    VITE_API_URL=$VITE_API_URL \
    VITE_OIDC_AUTHORITY=$VITE_OIDC_AUTHORITY \
    VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID

RUN npm run build

FROM nginx:1.29-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
