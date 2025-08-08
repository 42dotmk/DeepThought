FROM node:22-alpine

RUN apk add --no-cache \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY tsconfig.json ./

COPY src/ ./src/

RUN npm run build

RUN npm prune --production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S deepthought -u 1001

RUN chown -R deepthought:nodejs /app
USER deepthought

# Expose the port (if your bot uses HTTP endpoints in the future)
# EXPOSE 3000

CMD ["node", "build/index.js"]
