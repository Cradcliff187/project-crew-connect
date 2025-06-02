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

# Copy server package files
COPY server/package*.json ./server/

# Install frontend dependencies
RUN npm install

# Install server dependencies
RUN cd server && npm install

# Copy source code
COPY . .

# Build the frontend for production
RUN npm run build

# Set working directory to server
WORKDIR /app/server

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
