# Use Node.js 18 LTS as the base image
FROM node:18-alpine

# Install necessary packages for canvas (required by your dependencies)
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

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Build the TypeScript project
RUN npm run build

# Remove TypeScript and dev dependencies to reduce image size
RUN npm prune --production

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S deepthought -u 1001

# Change ownership of the app directory
RUN chown -R deepthought:nodejs /app
USER deepthought

# Expose the port (if your bot uses HTTP endpoints in the future)
# EXPOSE 3000

# Start the application
CMD ["node", "build/index.js"]
