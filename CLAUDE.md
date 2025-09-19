# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Neuro Proxy** (also known as Kalla Proxy) is a comprehensive Docker and Traefik management dashboard built with Next.js 15, providing real-time container monitoring, reverse proxy configuration, and infrastructure scaling capabilities.

## Development Commands

### Essential Commands
- **Development**: `bun run dev` - Runs Prisma DB push then Next.js dev server
- **Development Server**: `bun run dev:server` - Runs custom server with TypeScript support
- **Production Build**: `bun run build` - Builds application with database setup
- **Production Start**: `bun start` - Starts production server with database setup
- **Server Start**: `bun run start:server` - Starts custom production server
- **Lint**: `bun run lint` - ESLint with auto-fix enabled
- **Database Seed**: `bun run seed` - Seeds database with initial data

### Database Management
- **Schema Push**: `npx prisma db push` - Apply schema changes to database
- **Database Seed**: `npx prisma db seed` - Run seed script from `prisma/seed.ts`
- **Prisma Studio**: `npx prisma studio` - Visual database browser (if needed)

## Architecture Overview

### Core Technologies
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI Framework**: HeroUI (NextUI v2 fork) with Tailwind CSS
- **Database**: SQLite with Prisma ORM and pagination extension
- **Authentication**: NextAuth.js v5 with JWT and CASL authorization
- **Dependency Injection**: TSyringe with reflect-metadata
- **External Integrations**: Docker API, Traefik API

### Key Architecture Patterns

#### Repository Pattern Implementation
The codebase uses a sophisticated repository pattern organized in `repositories/`:
- **Base Repository** (`repositories/database/base.db.ts`): Shared Prisma client with pagination
- **Database Repositories**: Handle all database operations with role-based access
- **API Repositories**: External service integrations (Docker, Traefik)
- **File Repositories**: File system operations for logs and configurations

#### Dependency Injection with TSyringe
- **Container Setup**: `server-container.ts` exports configured TSyringe container
- **Instrumentation**: `instrumentation.ts` initializes container on server startup
- **Decorators**: Use `@singleton()` for service classes requiring dependency injection
- **Resolution**: Import container and resolve dependencies in server actions

#### Authentication & Authorization
- **NextAuth Config**: `auth.ts` configures credentials provider with Prisma adapter
- **CASL Integration**: `libs/casl-ability.lib.ts` and `contexts/casl.context.ts` handle permissions
- **Session Management**: JWT with 24-hour expiration, role-based access control
- **Permission Loading**: `libs/permission.lib.ts` converts database permissions to CASL rules

### Project Structure

```
app/                          # Next.js App Router
├── auth/                     # Authentication pages (signin, signup)
├── panel/                    # Main dashboard application
│   ├── [feature]/           # Feature-based routing with co-located actions
│   ├── _hook/               # Custom React Query hooks
│   └── _action/             # Server actions for data mutations
├── api/                     # API routes (NextAuth, health, logs)
└── providers.tsx            # Global client providers

components/                   # Reusable UI components
repositories/                 # Repository pattern implementation
├── database/                # Prisma database operations
├── api/                     # External API integrations
└── file/                    # File system operations

libs/                        # Utility libraries and configurations
contexts/                    # React contexts (CASL abilities)
hooks/                       # Global custom hooks
prisma/                      # Database schema, migrations, seed
traefik/                     # Traefik configuration files
```

### Integration Points

#### Docker API Integration
- **Socket Access**: Connects to `/var/run/docker.sock` for container management
- **Repository**: `repositories/api/docker/docker.api.ts` handles all Docker operations
- **Operations**: Container lifecycle, network management, scaling, log streaming
- **Volume Mounting**: Requires Docker socket volume mount in production

#### Traefik API Integration
- **Configuration**: Environment variables for `TRAEFIK_API_URL` and `TRAEFIK_API_KEY`
- **Repository**: `repositories/api/traefik/traefik.api.ts` manages routing and services
- **File Provider**: `traefik/config.yml` for dynamic configuration updates
- **Authentication**: Base64-encoded basic auth for API access

#### Database Schema
Key models in `prisma/schema.prisma`:
- **User**: Authentication with bcrypt password hashing
- **Company**: Multi-tenant organization support
- **Role/Permission**: CASL-compatible authorization system
- **Subject**: Permission subjects for fine-grained access control

## Development Guidelines

### Server Actions Pattern
Server actions are co-located with pages in `_action/` folders:
```typescript
'use server';
import container from '@/server-container';
import {ServiceRepository} from '@/repositories/database/service.db';

const serviceRepository = container.resolve(ServiceRepository);

export const getDataAction = async () => {
    try {
        const data = await serviceRepository.findAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, message: 'Error message' };
    }
};
```

### React Query Integration
Custom hooks in `_hook/` folders use useAsyncList for table management:
```typescript
const useDataHook = () => {
    const list = useAsyncList({
        async load({filterText, sortDescriptor}) {
            const result = await getDataAction();
            return { items: result.data };
        },
    });

    return { list, /* other methods */ };
};
```

### Component Patterns
- **Server Components**: Pages with data fetching, layouts with authentication
- **Client Components**: Interactive UI, forms, real-time updates
- **HeroUI Components**: Consistent component library usage with theme integration
- **Form Handling**: React Hook Form with Zod validation schemas

### Permission System
Use CASL for authorization checks:
```typescript
import { Can } from '@casl/react';

<Can I="read" a="Container">
    <ContainerComponent />
</Can>
```

## Environment Setup

### Required Environment Variables
```env
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
TRAEFIK_API_URL="http://localhost:8080"
DOCKER_HOST="unix:///var/run/docker.sock"
```

### Docker Development
- **Compose File**: `docker-compose.yml` includes volume mounts and environment setup
- **Socket Mounting**: `/var/run/docker.sock:/var/run/docker.sock:ro` required for Docker integration
- **Traefik Config**: `traefik/` directory mounted for configuration management

## Key Integration Requirements

### TypeScript Configuration
- **Decorators**: `experimentalDecorators: true` required for TSyringe
- **Server Config**: `tsconfig.server.json` for custom server compilation
- **Module Resolution**: Paths configured for `@/` imports

### Database Considerations
- **SQLite File**: Database stored in `prisma/db/database.db`
- **Pagination**: Prisma client extended with pagination capabilities
- **Seeding**: `prisma/seed.ts` creates initial admin user and permissions

### Security Considerations
- **Authentication**: Bcrypt for password hashing, JWT for sessions
- **Authorization**: CASL for fine-grained permissions
- **API Security**: Basic auth for Traefik API, Docker socket permissions
- **Multi-tenancy**: Company-based resource isolation

## Testing and Quality

### Linting Configuration
- **ESLint**: Configured with Next.js, TypeScript, and Prettier integration
- **Auto-fix**: Enabled by default with `--fix` flag
- **Unused Imports**: Plugin configured to remove unused imports automatically

### Development Workflow
1. Database setup: `npx prisma db push && npx prisma db seed`
2. Development: `bun run dev` (includes database setup)
3. Linting: `bun run lint` (auto-fixes issues)
4. Production: `bun run build && bun start`