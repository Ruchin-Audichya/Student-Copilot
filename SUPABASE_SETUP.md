# Supabase Integration & Agentic AI Setup Guide

## 🚀 Quick Setup

### 1. Environment Variables
Create a `.env` file in your root directory with:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration
DATABASE_URL=your_supabase_database_url

# AI/ML Services (for future agentic features)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Web Scraping Services (for internship scraping)
SCRAPING_BEE_API_KEY=your_scraping_bee_api_key
BRIGHT_DATA_API_KEY=your_bright_data_api_key
```

### 2. Supabase Project Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down your project URL and API keys

2. **Enable Extensions**:
   ```sql
   -- Enable pgvector for semantic search
   CREATE EXTENSION IF NOT EXISTS vector;
   
   -- Enable pg_trgm for text search
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

3. **Run Database Migrations**:
   ```bash
   npm run db:push
   ```

## 🤖 Agentic AI Architecture

### Current Implementation
- ✅ **Supabase Storage**: Real-time database with PostgreSQL
- ✅ **Drizzle ORM**: Type-safe database operations
- ✅ **Real-time Subscriptions**: Live updates for internships
- ✅ **Enhanced Search**: Full-text search with filters

### Next Steps for Agentic AI

#### Phase 1: Web Scraping Infrastructure
```typescript
// Edge Function: scrape-internships
export async function scrapeInternships() {
  const sources = [
    'https://www.linkedin.com/jobs/internship',
    'https://www.indeed.com/internships',
    'https://angel.co/jobs',
    'https://www.glassdoor.com/Internships'
  ];
  
  // AI-powered scraping with rotation and rate limiting
  // Store with vector embeddings for semantic search
}
```

#### Phase 2: AI-Powered Matching
```typescript
// Enhanced matching with AI
async function aiMatchInternships(student: Student, internships: Internship[]) {
  // 1. Generate embeddings for student skills and interests
  // 2. Generate embeddings for internship requirements
  // 3. Use cosine similarity for semantic matching
  // 4. Apply ML model for personalized ranking
}
```

#### Phase 3: Intelligent Recommendations
```typescript
// Smart recommendation engine
async function generateRecommendations(student: Student) {
  // 1. Analyze student's learning patterns
  // 2. Predict skill development trajectory
  // 3. Recommend internships based on future potential
  // 4. Suggest skill-building projects
}
```

## 📊 Database Schema Enhancements

### Current Tables
- `students`: User profiles with skills and interests
- `internships`: Job postings with requirements
- `projects`: Learning projects with technologies

### Future Additions
```sql
-- Vector embeddings for semantic search
ALTER TABLE internships ADD COLUMN embedding vector(1536);

-- Skill proficiency tracking
CREATE TABLE skill_progress (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  skill_name TEXT NOT NULL,
  proficiency_level INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Learning recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  type TEXT NOT NULL, -- 'internship', 'project', 'skill'
  item_id UUID,
  confidence_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Real-time Features

### Current Implementation
```typescript
// Real-time internship updates
const unsubscribe = storage.getRealTimeInternships((internships) => {
  // Update UI when new internships are added
  setInternships(internships);
});
```

### Future Enhancements
```typescript
// Personalized notifications
const subscription = supabase
  .channel('personalized-internships')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'internships',
    filter: `required_skills.cs.{${studentSkills.join(',')}}`
  }, (payload) => {
    // Notify student about relevant new internships
    showNotification('New internship matching your skills!');
  })
  .subscribe();
```

## 🎯 Agentic AI Workflow

### 1. Data Collection
```
Web Scrapers → AI Processors → Supabase DB
     ↓              ↓              ↓
  Job Sites    Skill Matching   Vector Store
```

### 2. Intelligent Matching
```
Student Profile → AI Analysis → Personalized Matches
      ↓              ↓              ↓
   Skills/Interests  ML Model    Ranked Results
```

### 3. Continuous Learning
```
User Interactions → Feedback Loop → Model Improvement
       ↓                ↓              ↓
   Apply/Reject    Preference Data   Better Matches
```

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Push database schema changes
npm run db:push

# Generate new migration
npx drizzle-kit generate

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **Missing Environment Variables**:
   ```bash
   Error: Missing Supabase environment variables
   ```
   Solution: Ensure all required env vars are set in `.env`

2. **Database Connection Issues**:
   ```bash
   Error: connection terminated
   ```
   Solution: Check `DATABASE_URL` and Supabase project status

3. **Real-time Not Working**:
   - Verify Supabase project has real-time enabled
   - Check Row Level Security (RLS) policies
   - Ensure proper authentication

## 📈 Performance Optimization

### Database Indexes
```sql
-- Full-text search index
CREATE INDEX idx_internships_search ON internships 
USING gin(to_tsvector('english', title || ' ' || company || ' ' || description));

-- Vector similarity index
CREATE INDEX idx_internships_embedding ON internships 
USING ivfflat (embedding vector_cosine_ops);
```

### Caching Strategy
```typescript
// Redis caching for frequently accessed data
const cacheKey = `internships:${studentId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const internships = await storage.findInternships(studentId);
await redis.setex(cacheKey, 3600, JSON.stringify(internships));
```

## 🚀 Deployment

### Vercel/Netlify
1. Set environment variables in deployment platform
2. Ensure Supabase project is accessible from deployment region
3. Configure CORS settings in Supabase

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Next Steps

1. **Set up Supabase project** and add environment variables
2. **Run database migrations** to create tables
3. **Test real-time features** with sample data
4. **Implement web scraping** with Edge Functions
5. **Add AI-powered matching** with embeddings
6. **Deploy and monitor** performance

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs) or create an issue in the repository. 