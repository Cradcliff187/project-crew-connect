# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies for building
RUN npm install --frozen-lockfile

# Copy all source files
COPY . .

# Set calendar IDs as build-time environment variables
ENV VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
ENV VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com

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
COPY server-google-calendar-auth.cjs ./
COPY server-body-parser-fix.cjs ./
COPY server-supabase-session-store.cjs ./
COPY server-api-endpoints.cjs ./
COPY server-service-account.cjs ./

# Create a simple test to verify files exist
RUN ls -la && \
    test -f server-production.cjs && \
    test -f server-google-calendar-auth.cjs && \
    test -f server-body-parser-fix.cjs && \
    test -f server-supabase-session-store.cjs && \
    test -f server-api-endpoints.cjs && \
    test -f server-service-account.cjs && \
    test -d dist && \
    echo "Files verified"

# Expose port
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080

# Start the server
CMD ["node", "server-production.cjs"]
