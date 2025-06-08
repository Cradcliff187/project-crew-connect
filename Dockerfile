# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies for building
RUN npm install --frozen-lockfile

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies directly in the final image
COPY package*.json ./
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy the production server and dependencies
COPY server-production.cjs ./
COPY server-api-endpoints.cjs ./

# Create a simple test to verify files exist
RUN ls -la && \
    test -f server-production.cjs && \
    test -f server-api-endpoints.cjs && \
    test -d dist && \
    echo "Files verified"

# Expose port
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080

# Start the server
CMD ["node", "server-production.cjs"]
