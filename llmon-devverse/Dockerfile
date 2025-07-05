# LLMON DevVerse Docker Container
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY server/ ./server/
COPY client/ ./client/
COPY *.md ./

# Create projects directory
RUN mkdir -p projects

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Create non-root user
RUN addgroup -g 1001 -S llmon && \
    adduser -S llmon -u 1001

# Change ownership of app directory
RUN chown -R llmon:llmon /app

# Switch to non-root user
USER llmon

# Start the application
CMD ["npm", "start"]