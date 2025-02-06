# Build the Next.js application
pnpm build

# Build and push Docker image
./scripts/build-push.sh

# Start the production services
docker-compose -f ../deployments/docker-compose.prod.yml up -d

# Initialize SSL certificates
chmod +x scripts/init-letsencrypt.sh
./scripts/init-letsencrypt.sh
