# 🚀 Student Co-Pilot: Agentic AI Internship Finder

A cutting-edge platform that uses **Agentic AI** to automatically discover, match, and recommend internships for students. Built with modern tech stack and intelligent automation.

## 🌟 Features

### 🤖 Agentic AI Capabilities
- **Automatic Web Scraping**: AI-powered scraping of job sites (LinkedIn, Indeed, AngelList)
- **Intelligent Matching**: ML-based skill matching with semantic understanding
- **Real-time Updates**: Live notifications when new relevant internships are found
- **Smart Recommendations**: Personalized suggestions based on learning patterns

### 🎯 Core Features
- **Student Onboarding**: Multi-step profile creation with skill assessment
- **Internship Discovery**: Advanced search with AI-powered filtering
- **Skill Gap Analysis**: Personalized learning paths for target roles
- **Project Recommendations**: Curated projects to build relevant skills
- **Real-time Dashboard**: Live updates and notifications

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - API server
- **Supabase** - Real-time database with PostgreSQL
- **Drizzle ORM** - Type-safe database operations
- **Deno** - Edge Functions for AI processing

### Frontend
- **React** + **TypeScript** - Modern UI
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **React Query** - Data fetching and caching

### AI/ML
- **OpenAI/Anthropic** - Language models for text processing
- **Vector Embeddings** - Semantic search capabilities
- **pgvector** - Vector similarity search in PostgreSQL

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd StudentCopilot
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration
DATABASE_URL=your_supabase_database_url

# AI/ML Services (optional for enhanced features)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Database Setup
```bash
# Push schema to Supabase
npm run db:push

# Or generate migrations
npx drizzle-kit generate
```

### 4. Start Development
```bash
# Start both frontend and backend
npm run dev
```

Visit `http://localhost:3000` to see the application!

## 🤖 Agentic AI Architecture

### How It Works

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Scrapers  │───▶│  AI Processors  │───▶│  Supabase DB    │
│   (Edge Funcs)  │    │  (Edge Funcs)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Job Sites      │    │  Skill Matching │    │  Real-time      │
│  (LinkedIn,     │    │  & Ranking      │    │  Notifications  │
│   Indeed, etc.) │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1. Data Collection Phase
- **Automated Scraping**: Edge functions scrape job sites every 6 hours
- **Intelligent Parsing**: AI extracts skills, requirements, and details
- **Data Cleaning**: Automated text processing and standardization

### 2. AI Processing Phase
- **Skill Extraction**: NLP models identify required skills from job descriptions
- **Semantic Matching**: Vector embeddings for similarity search
- **Ranking Algorithm**: ML-based scoring for personalized recommendations

### 3. Real-time Delivery
- **Live Updates**: WebSocket connections for instant notifications
- **Personalized Feeds**: AI-curated internship recommendations
- **Smart Filtering**: Context-aware search and filtering

## 📊 Database Schema

### Core Tables
```sql
-- Students with skills and interests
CREATE TABLE students (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  year INTEGER NOT NULL,
  skills JSONB DEFAULT '[]',
  interests JSONB DEFAULT '[]'
);

-- Internships with AI-extracted data
CREATE TABLE internships (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  stipend TEXT NOT NULL,
  duration TEXT NOT NULL,
  required_skills JSONB DEFAULT '[]',
  description TEXT NOT NULL,
  source TEXT,
  url TEXT
);

-- Learning projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration TEXT NOT NULL,
  technologies JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]'
);
```

## 🔧 API Endpoints

### Student Management
```http
POST /api/onboard          # Create student profile
PUT /api/student/:id       # Update student profile
GET /api/student/email/:email  # Get student by email
```

### Internship Discovery
```http
GET /api/find-internships/:studentId    # Get matched internships
POST /api/find-internships              # Advanced search with filters
GET /api/internships                    # Get all internships
POST /api/search-internships            # AI-powered search
```

### Agentic AI Features
```http
POST /api/scrape-internships            # Trigger AI scraping
GET /api/internships/realtime           # Real-time updates (SSE)
POST /api/skill-gap                     # Skill gap analysis
```

### Project Recommendations
```http
GET /api/projects/:studentId            # Personalized projects
GET /api/projects                       # All projects
```

## 🎯 Usage Examples

### 1. Student Onboarding
```typescript
// Create student profile
const student = await fetch('/api/onboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@university.edu',
    year: 3,
    skills: ['React', 'JavaScript', 'Node.js'],
    interests: ['Web Development', 'AI/ML']
  })
});
```

### 2. Find Matching Internships
```typescript
// Get AI-matched internships
const internships = await fetch('/api/find-internships/student-id');
const matches = await internships.json();
// Returns: { success: true, internships: [...] }
```

### 3. Real-time Updates
```typescript
// Subscribe to real-time internship updates
const eventSource = new EventSource('/api/internships/realtime');
eventSource.onmessage = (event) => {
  const { internships } = JSON.parse(event.data);
  // Update UI with new internships
};
```

### 4. Trigger AI Scraping
```typescript
// Manually trigger internship scraping
const result = await fetch('/api/scrape-internships', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sources: ['linkedin', 'indeed', 'angel'],
    force: true
  })
});
```

## 🚀 Deployment

### Vercel/Netlify
1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

### Docker
```bash
# Build image
docker build -t student-copilot .

# Run container
docker run -p 3000:3000 student-copilot
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔍 Advanced Features

### AI-Powered Matching Algorithm
```typescript
// Enhanced matching with semantic similarity
async function aiMatchInternships(student: Student, internships: Internship[]) {
  // 1. Generate embeddings for student skills
  const studentEmbedding = await generateEmbedding(student.skills.join(' '));
  
  // 2. Generate embeddings for internship requirements
  const internshipEmbeddings = await Promise.all(
    internships.map(intern => generateEmbedding(intern.requiredSkills.join(' ')))
  );
  
  // 3. Calculate cosine similarity
  const matches = internships.map((intern, index) => ({
    ...intern,
    similarity: cosineSimilarity(studentEmbedding, internshipEmbeddings[index])
  }));
  
  return matches.sort((a, b) => b.similarity - a.similarity);
}
```

### Real-time Notifications
```typescript
// Personalized notifications for new internships
const subscription = supabase
  .channel('personalized-internships')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'internships',
    filter: `required_skills.cs.{${studentSkills.join(',')}}`
  }, (payload) => {
    showNotification('New internship matching your skills!');
  })
  .subscribe();
```

## 📈 Performance Optimization

### Database Indexes
```sql
-- Full-text search
CREATE INDEX idx_internships_search ON internships 
USING gin(to_tsvector('english', title || ' ' || company || ' ' || description));

-- Vector similarity
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@studentcopilot.com
- 💬 Discord: [Join our community](https://discord.gg/studentcopilot)
- 📖 Documentation: [docs.studentcopilot.com](https://docs.studentcopilot.com)

## 🙏 Acknowledgments

- Built with ❤️ for students worldwide
- Powered by cutting-edge AI/ML technologies
- Inspired by the need for better internship discovery

---

**Ready to revolutionize internship discovery?** 🚀

Start building your future with AI-powered internship matching! 