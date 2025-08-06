# Student Co-Pilot AI Dashboard

## Overview

A full-stack AI-powered career guidance dashboard for B.Tech students that helps them find internships, analyze skill gaps, and get personalized project recommendations. The application uses React with TypeScript for the frontend, Express.js for the backend, and PostgreSQL with Drizzle ORM for data persistence. The system features multi-step onboarding, intelligent matching algorithms, and AI-driven recommendations to guide students through their career development journey.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing between pages (Landing, Onboarding, Internships, Skills, Projects)
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **API Design**: RESTful endpoints with CORS enabled for cross-origin requests
- **Data Storage**: In-memory storage (MemStorage class) implementing IStorage interface for development, designed to be easily swapped with database persistence
- **Schema Validation**: Zod schemas for runtime type checking and validation of API inputs/outputs
- **Development**: Vite integration for hot module replacement and seamless development experience

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema Management**: Drizzle Kit for migrations and schema management in ./migrations directory
- **Connection**: Neon Database serverless driver for PostgreSQL connectivity
- **Development Storage**: In-memory storage implementation for rapid prototyping and testing

### Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **Security**: CORS middleware configured for cross-origin resource sharing
- **Data Validation**: Comprehensive input validation using Zod schemas on both client and server

### External Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **AI Integration**: Placeholder for OpenRouter API integration for AI-powered recommendations
- **Web Scraping**: BeautifulSoup integration planned for internship data collection
- **Component Library**: Radix UI for accessible, unstyled UI primitives
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation and formatting
- **Build Tools**: esbuild for production bundling, PostCSS for CSS processing

### Core Features
- **Multi-step Onboarding**: Collects student profile data (personal info, skills, interests) through progressive forms
- **Internship Matching**: AI-powered internship recommendations with match scoring based on student profile
- **Skill Gap Analysis**: Identifies missing skills for target roles and generates learning plans
- **Project Recommendations**: Suggests relevant projects based on student interests and skill level
- **Responsive Design**: Mobile-first approach with adaptive layouts for all devices

### Development Environment
- **Replit Integration**: Configured with Replit-specific plugins for development banner and cartographer
- **Error Handling**: Runtime error overlay for development debugging
- **Path Aliases**: Configured TypeScript paths for clean imports (@/, @shared/, @assets/)
- **Hot Reload**: Vite HMR for instant feedback during development