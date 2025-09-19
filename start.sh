#!/bin/sh

# Startup script for Traefik + Dashboard integration
echo "🚀 Starting Kalla Proxy (Traefik + Dashboard)..."

# Function to handle graceful shutdown
cleanup() {
    echo "🛑 Received shutdown signal, stopping services..."
    if [ ! -z "$TRAEFIK_PID" ]; then
        kill -TERM "$TRAEFIK_PID" 2>/dev/null
        echo "   ✓ Traefik stopped"
    fi
    if [ ! -z "$DASHBOARD_PID" ]; then
        kill -TERM "$DASHBOARD_PID" 2>/dev/null
        echo "   ✓ Dashboard stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup TERM INT

# Set environment variables
export NODE_ENV=production
export TRAEFIK_API_URL=http://localhost:8080
export AUTH_TRUST_HOST=true
export HOSTNAME=0.0.0.0

# Initialize database
echo "📊 Initializing database..."
cd /app
pnpm prisma db push --accept-data-loss || {
    echo "❌ Database initialization failed"
    exit 1
}

# Seed database with initial data
echo "🌱 Seeding database..."
pnpm seed || {
    echo "⚠️  Database seeding failed (non-critical, continuing...)"
    # Not exiting on seed failure as it might already be seeded
}

# Start Traefik in background
echo "🌐 Starting Traefik proxy..."
traefik \
    --configfile=/etc/traefik/traefik.yml \
    --log.level=INFO \
    --log.filepath=/app/traefik/traefik.log \
    --accesslog=true \
    --accesslog.filepath=/app/traefik/traefik.log &

TRAEFIK_PID=$!
echo "   ✓ Traefik started with PID: $TRAEFIK_PID"

# Wait for Traefik to be ready
echo "⏳ Waiting for Traefik to be ready..."
for i in $(seq 1 30); do
    if curl -s http://localhost:8080/ping > /dev/null 2>&1; then
        echo "   ✓ Traefik is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Traefik failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

# Start Dashboard
echo "📊 Starting Next.js Dashboard..."
cd /app
pnpm start &
DASHBOARD_PID=$!
echo "   ✓ Dashboard started with PID: $DASHBOARD_PID"

# Wait for Dashboard to be ready
echo "⏳ Waiting for Dashboard to be ready..."
for i in $(seq 1 60); do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "   ✓ Dashboard is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ Dashboard failed to start within 60 seconds"
        exit 1
    fi
    sleep 1
done

echo ""
echo "🎉 Kalla Proxy is running!"
echo "   🌐 Traefik Proxy: http://localhost:80"
echo "   📊 Traefik Dashboard: http://localhost:8080"
echo "   🎛️  Management Dashboard: http://localhost:3000"
echo ""

# Keep the script running and wait for child processes
wait $TRAEFIK_PID $DASHBOARD_PID