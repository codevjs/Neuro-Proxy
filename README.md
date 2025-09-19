# 🚀 Kalla Proxy

**Kalla Proxy** is a comprehensive Docker and Traefik management dashboard that provides an intuitive web interface for managing your containerized applications, reverse proxy configurations, and infrastructure scaling. Built with modern technologies, it offers real-time monitoring, auto-scaling capabilities, and seamless integration with Docker and Traefik ecosystems.

![Kalla Proxy Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)
![Traefik](https://img.shields.io/badge/Traefik-Integrated-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

## ✨ Features

### 🐳 **Container Management**
- **Real-time Container Monitoring**: View, start, stop, and restart Docker containers
- **Container Statistics**: CPU, memory, and network usage metrics
- **Container Logs**: Real-time log streaming and historical log viewing
- **Network Management**: Join/leave container networks dynamically
- **Container Duplication**: Clone containers with preserved configurations

### 🔀 **Traefik Integration**
- **Dynamic Router Management**: Create, update, and delete Traefik routers
- **Service Configuration**: Manage load balancers and service endpoints
- **Middleware Support**: Configure authentication, rate limiting, and custom middlewares
- **Entry Point Management**: HTTP/HTTPS endpoint configuration
- **Live Configuration**: Real-time Traefik configuration updates

### 📊 **Route Testing & Visualization**
- **Interactive Route Tester**: Test routes with custom headers and parameters
- **Flow Visualization**: Animated request flow showing Client → Middleware(s) → Service
- **Response Analysis**: Detailed response headers, body, and timing information
- **Custom Headers**: Add authentication tokens and custom HTTP headers
- **Multi-environment Support**: Works on localhost, HTTP, and HTTPS environments

### ⚡ **Manual Scaling System**
- **Horizontal Scaling**: Scale services up/down with load balancing
- **Container Replication**: Duplicate containers automatically
- **Load Balancer Updates**: Automatic Traefik load balancer configuration
- **Scaling History**: Track scaling operations and replica status
- **Resource Management**: Monitor scaled service performance

### 🔐 **Security & Authentication**
- **Role-Based Access Control (RBAC)**: Granular permissions system
- **JWT Authentication**: Secure session management with NextAuth.js
- **API Token Management**: Generate and manage API access tokens
- **Middleware Authentication**: Secure routes with various auth methods
- **Audit Logging**: Track user actions and system changes

### 📋 **User Management**
- **Multi-user Support**: User registration and management
- **Company/Organization**: Multi-tenant architecture support
- **Permission Management**: Assign roles and permissions to users
- **Activity Tracking**: Monitor user actions and access patterns

### 🛠️ **System Features**
- **Responsive Dashboard**: Mobile-friendly interface with dark/light themes
- **Real-time Updates**: WebSocket connections for live data
- **Configuration Management**: YAML-based Traefik configuration editor
- **Log Management**: Centralized logging with filtering and search
- **Health Monitoring**: System health checks and alerts

## 🏗️ Architecture

### **Technology Stack**
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI Framework**: HeroUI (NextUI v2 fork), Tailwind CSS
- **Authentication**: NextAuth.js v5 with JWT
- **Database**: SQLite with Prisma ORM
- **Container Runtime**: Docker API integration
- **Reverse Proxy**: Traefik v2/v3 integration
- **State Management**: React Query, React Hook Form
- **Authorization**: CASL (isomorphic authorization)
- **Dependency Injection**: TSyringe

### **Architecture Patterns**
- **Repository Pattern**: Clean separation of data access layers
- **Dependency Injection**: Modular and testable code structure
- **Server Components**: Next.js App Router with Server Actions
- **API-First Design**: RESTful APIs with TypeScript interfaces

## 🚀 Installation

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 18+** (for development)
- **Git** for cloning the repository

### Quick Start with Docker Compose

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/kalla-proxy.git
   cd kalla-proxy
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the Dashboard**
   - Dashboard: `http://localhost/panel`
   - Traefik Dashboard: `http://localhost:8080` (if enabled)

### Environment Variables

Create a `.env` file with the following configuration:

```env
# Database
DATABASE_URL="file:./prisma/db/database.db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Traefik API Configuration
TRAEFIK_API_URL="http://localhost:8080"
TRAEFIK_API_KEY="base64-encoded-basic-auth"

# Docker Configuration (if using remote Docker)
DOCKER_HOST="unix:///var/run/docker.sock"

# Application Settings
NODE_ENV="production"
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  kalla-proxy:
    build: .
    container_name: kalla-proxy
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:/app/prisma/db/database.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - TRAEFIK_API_URL=${TRAEFIK_API_URL}
      - TRAEFIK_API_KEY=${TRAEFIK_API_KEY}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - database_volume:/app/prisma/db
      - traefik_volume:/app/traefik
    restart: unless-stopped

volumes:
  database_volume:
  traefik_volume:
```

## 📚 Documentation

### API Endpoints

#### Authentication
```http
POST /api/auth/signin    # User login
POST /api/auth/signout   # User logout
GET  /api/auth/session   # Get current session
```

#### Container Management
```http
GET    /api/containers              # List all containers
GET    /api/containers/:id          # Get container details
POST   /api/containers/:id/start    # Start container
POST   /api/containers/:id/stop     # Stop container
POST   /api/containers/:id/restart  # Restart container
DELETE /api/containers/:id          # Remove container
```

#### Traefik Management
```http
GET    /api/traefik/routers         # List routers
POST   /api/traefik/routers         # Create router
PUT    /api/traefik/routers/:name   # Update router
DELETE /api/traefik/routers/:name   # Delete router

GET    /api/traefik/services        # List services
GET    /api/traefik/middlewares     # List middlewares
```

#### Scaling Operations
```http
POST   /api/scaling/up/:service     # Scale up service
POST   /api/scaling/down/:service   # Scale down service
GET    /api/scaling/status          # Get scaling status
```

### Configuration Files

#### Traefik Configuration (`traefik/config.yml`)
```yaml
http:
  routers:
    my-app:
      rule: "Host(`example.com`)"
      service: my-app-service
      middlewares:
        - auth@file
      entryPoints:
        - web

  services:
    my-app-service:
      loadBalancer:
        servers:
          - url: "http://my-app:3000"

  middlewares:
    auth:
      basicAuth:
        users:
          - "admin:$2y$10$..."
```

#### Database Schema
The application uses Prisma ORM with SQLite. Key entities:
- **Users**: User accounts and profiles
- **Companies**: Multi-tenant organizations
- **Roles**: Permission-based access control
- **Containers**: Docker container metadata
- **ScalingHistory**: Scaling operation logs

### Development Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone https://github.com/your-repo/kalla-proxy.git
   cd kalla-proxy
   pnpm install
   ```

2. **Database Setup**
   ```bash
   npx prisma db push    # Create database schema
   npx prisma db seed    # Seed initial data
   ```

3. **Development Server**
   ```bash
   pnpm dev             # Start Next.js dev server
   pnpm dev:server      # Start with custom server (scaling features)
   ```

4. **Build for Production**
   ```bash
   pnpm build           # Build application
   pnpm start           # Start production server
   ```

### Docker Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose up -d

# Logs
docker-compose logs -f kalla-proxy

# Reset
docker-compose down -v  # Remove volumes
docker-compose up -d
```

## 🔧 Configuration

### Traefik Integration

1. **Enable Traefik API**
   ```yaml
   # traefik.yml
   api:
     dashboard: true
     insecure: true  # For development only
   
   providers:
     docker:
       endpoint: "unix:///var/run/docker.sock"
     file:
       directory: /etc/traefik
       watch: true
   ```

2. **Configure Authentication**
   ```bash
   # Generate basic auth password
   echo $(htpasswd -nb admin password) | base64
   
   # Add to environment
   TRAEFIK_API_KEY="YWRtaW46JGFwcjEkLi4u"
   ```

### Scaling Configuration

1. **Service Requirements**
   - Container must be part of Docker Compose
   - Traefik service configuration must exist
   - Container must expose consistent ports

2. **Load Balancer Setup**
   ```yaml
   # Automatic load balancer configuration
   services:
     my-service:
       loadBalancer:
         servers:
           - url: "http://my-app:3000"
           - url: "http://my-app-replica-1:3000"
           - url: "http://my-app-replica-2:3000"
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Container Connection Issues**
   ```bash
   # Check Docker socket permissions
   sudo chmod 666 /var/run/docker.sock
   
   # Verify Docker API access
   curl --unix-socket /var/run/docker.sock http://localhost/containers/json
   ```

2. **Traefik API Not Accessible**
   ```bash
   # Check Traefik configuration
   docker-compose logs traefik
   
   # Verify API endpoint
   curl http://localhost:8080/api/http/routers
   ```

3. **Database Issues**
   ```bash
   # Reset database
   rm -f prisma/db/database.db
   npx prisma db push
   npx prisma db seed
   ```

4. **Clipboard Issues on VPS**
   - The application automatically detects HTTPS/HTTP context
   - HTTP environments use legacy clipboard methods
   - No additional configuration required

### Performance Tuning

1. **Memory Optimization**
   ```yaml
   # docker-compose.yml
   services:
     kalla-proxy:
       deploy:
         resources:
           limits:
             memory: 512M
           reservations:
             memory: 256M
   ```

2. **Database Optimization**
   ```bash
   # Regular database maintenance
   npx prisma db push --force-reset  # Development only
   ```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit changes: `git commit -m 'feat: add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Traefik](https://traefik.io/) - Modern HTTP reverse proxy and load balancer
- [Docker](https://docker.com/) - Container platform
- [Next.js](https://nextjs.org/) - React framework
- [HeroUI](https://heroui.com/) - Modern React UI library
- [Prisma](https://prisma.io/) - Next-generation ORM

## 📞 Support

- **Documentation**: [Full Documentation](https://docs.kallaproxy.com)
- **Issues**: [GitHub Issues](https://github.com/your-repo/kalla-proxy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/kalla-proxy/discussions)
- **Email**: support@kallaproxy.com

---

**Made with ❤️ by the Kalla Proxy Team**