# Step 1: Build the application
FROM node:16 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Step 2: Set up the production environment
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY letsencrypt /etc/letsencrypt/live/hello-doc.enzosakamoto.com.br

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]