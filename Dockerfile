FROM node:22-alpine

WORKDIR /app

# Copy built dist folder and package files
COPY dist/ ./dist/
COPY package.json package-lock.json ./
COPY server-wrapper.js ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Set port
ENV PORT=8080

# Start the app
CMD ["node", "server-wrapper.js"]
