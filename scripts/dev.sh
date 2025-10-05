
echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# (Your Docker and .env checks can remain here)

# 1. Start all services in the background (detached mode)
echo "📦 Building and starting containers in the background..."
docker compose -f docker-compose.dev.yml up --build -d

# 2. Wait for the neon-local database to be healthy
echo "⏳ Waiting for the database to be ready..."
while ! docker compose -f docker-compose.dev.yml exec neon-local pg_isready -h localhost -p 5432 -U user > /dev/null 2>&1; do
    sleep 2
done
echo "✅ Database is ready."

# 3. Run migrations against localhost
# We override the DATABASE_URL to connect to localhost for this one command.
echo "📜 Applying database migrations..."
DATABASE_URL="postgresql://user:password@localhost:5432/neondb" npm run db:migrate

# 4. Bring the container logs to the foreground
echo "🎉 Development environment started! Attaching to logs..."
echo "   Application will be available at http://localhost:3000"
echo "   To stop the environment, press Ctrl+C"
echo ""
docker compose -f docker-compose.dev.yml logs -f