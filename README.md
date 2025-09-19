# 🚀 Neuro Proxy

**Neuro Proxy** (also known as Neuro Proxy) is a comprehensive Docker and Traefik management dashboard built with Next.js 15, providing real-time container monitoring, reverse proxy configuration, and infrastructure scaling capabilities. Featuring a modern teal design system that matches the brand identity.

![Neuro Proxy Dashboard](https://img.shields.io/badge/Status-Production%20Ready-19D5A5)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED)
![Traefik](https://img.shields.io/badge/Traefik-Integrated-F05A28)
![Next.js](https://img.shields.io/badge/Next.js-15.5.3-000000)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6)
![Bun](https://img.shields.io/badge/Bun-Runtime-000000)
![HeroUI](https://img.shields.io/badge/HeroUI-v2-19D5A5)

> **🌟 Key Highlights**: First-time user auto-setup • Teal design system • Real-time monitoring • Auto-scaling • Role-based security

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
- **Real-time Updates**: Live container stats and log streaming
- **Configuration Management**: YAML-based Traefik configuration editor
- **Log Management**: Centralized logging with filtering and search
- **Health Monitoring**: System health checks and alerts
- **First-time Setup**: Automatic superadmin creation on first run
- **Modern UI**: Teal design system with HeroUI components

## 🏗️ Architecture

### **Technology Stack**
- **Frontend**: Next.js 15.5.3 (App Router), React 19.1.1, TypeScript 5.6.3
- **UI Framework**: HeroUI (NextUI v2 fork) with Tailwind CSS and custom teal theme (#19D5A5)
- **Authentication**: NextAuth.js v5.0.0-beta.25 with JWT and CASL authorization
- **Database**: SQLite with Prisma ORM 6.16.2 and pagination extension
- **Runtime**: Bun for package management and development
- **Container Runtime**: Docker API integration with dockerode
- **Reverse Proxy**: Traefik API integration
- **State Management**: TanStack React Query 5.89.0, React Hook Form 7.62.0
- **Authorization**: CASL 6.7.3 (isomorphic authorization)
- **Dependency Injection**: TSyringe 4.10.0 with reflect-metadata

### **Architecture Patterns**
- **Repository Pattern**: Clean separation of data access layers
- **Dependency Injection**: Modular and testable code structure with TSyringe
- **Server Components**: Next.js App Router with Server Actions
- **API-First Design**: RESTful APIs with TypeScript interfaces
- **Multi-tenant**: Company-based resource isolation
- **Security-First**: CASL authorization with role-based permissions

### **Key Integrations**
- **Docker Socket**: Direct Docker API access (`/var/run/docker.sock`)
- **Traefik API**: Dynamic route and service management
- **Prisma Database**: SQLite with automatic migrations
- **NextAuth Session**: JWT-based authentication with 24-hour expiration

## 🚀 Installation

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 18+** (for development)
- **Git** for cloning the repository

### Quick Start with Docker Compose

1. **Clone the Repository**
   ```bash
   git clone https://github.com/codevjs/Neuro-Proxy.git
   cd Neuro-Proxy
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
   - Dashboard: `http://localhost:3000/panel/dashboard`
   - First-time Setup: `http://localhost:3000/auth/register` (creates superadmin)
   - Authentication: `http://localhost:3000/auth/signin`
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

# Docker Configuration (if using remote Docker)
DOCKER_HOST="unix:///var/run/docker.sock"

# Application Settings
NODE_ENV="production"
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  neuro-proxy:
    build: .
    container_name: neuro-proxy
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:/app/prisma/db/database.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - TRAEFIK_API_URL=${TRAEFIK_API_URL}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - database_volume:/app/prisma/db
      - traefik_volume:/app/traefik
    restart: unless-stopped

volumes:
  database_volume:
  traefik_volume:
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
   git clone https://github.com/codevjs/Neuro-Proxy.git
   cd Neuro-Proxy
   bun install
   ```

2. **Database Setup**
   ```bash
   bun prisma db push    # Create database schema
   bun run seed          # Seed initial data (optional - auto-created on first use)
   ```

3. **Development Server**
   ```bash
   bun run dev           # Start Next.js dev server with database setup
   bun run dev:server    # Start with custom server (scaling features)
   ```

4. **Build for Production**
   ```bash
   bun run build         # Build application with database setup
   bun start             # Start production server with database setup
   ```

5. **Code Quality**
   ```bash
   bun run lint          # Run ESLint with auto-fix
   ```

### Docker Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose up -d

# Logs
docker-compose logs -f neuro-proxy

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
   bun prisma db push
   bun run seed  # Optional - superadmin created on first access
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
     neuro-proxy:
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
   bun prisma db push --force-reset  # Development only
   ```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run linting: `bun run lint`
5. Commit changes: `git commit -m 'feat: add amazing feature'` (conventional commits)
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

- **Issues**: [GitHub Issues](https://github.com/codevjs/Neuro-Proxy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/codevjs/Neuro-Proxy/discussions)
- **Repository**: [GitHub Repository](https://github.com/codevjs/Neuro-Proxy)

## 🎨 Design System

Neuro Proxy features a modern design system with:
- **Primary Color**: Teal (`#19D5A5`) matching the brand logo
- **UI Framework**: HeroUI with Tailwind CSS
- **Theme Support**: Dark/Light mode with automatic detection
- **Responsive Design**: Mobile-first approach with tablet and desktop breakpoints
- **Typography**: Clean, modern font stack with proper hierarchy

---

**Made with ❤️ by the Neuro Proxy Team**

*Built with Claude Code assistance* 🤖