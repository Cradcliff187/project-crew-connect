# Use Node.js 18 as base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy root package files for frontend dependencies
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Install frontend dependencies
RUN npm install

# Copy server directory (for server dependencies if any)
COPY server/ ./server/

# Install server dependencies if server has its own package.json
RUN if [ -f server/package.json ]; then cd server && npm install && cd ..; fi

# Copy source code
COPY . .

# Build the frontend for production
RUN npm run build

# The built files should be in 'dist' directory

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080
ENV NODE_ENV=production

# Start the server from root directory
CMD ["node", "server.js"]
