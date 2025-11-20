FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker layer caching for dependencies
COPY package*.json ./

# Use npm ci for faster, deterministic installs when package-lock.json exists
RUN npm ci --silent

# Copy project files
COPY . .

EXPOSE 3000

# For development we run the Next.js dev server. For production, use Dockerfile.prod
CMD ["npm", "run", "dev"]
