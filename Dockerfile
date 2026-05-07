# Use Bun base image
FROM oven/bun:1.1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Run the application
ENTRYPOINT ["bun", "run", "src/index.ts"]
