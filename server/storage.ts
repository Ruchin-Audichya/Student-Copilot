import { type Student, type InsertStudent, type Internship, type InsertInternship, type Project, type InsertProject, type SkillGapAnalysis, type InternshipWithMatch } from "@shared/schema";
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { students, internships, projects } from '@shared/schema';
import { eq, ilike, or, and, desc, asc } from 'drizzle-orm';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Drizzle with Supabase
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);

export interface IStorage {
  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  
  // Internship operations
  getInternships(): Promise<Internship[]>;
  findInternships(studentId: string): Promise<InternshipWithMatch[]>;
  searchInternships(query: string, filters?: any): Promise<Internship[]>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getRecommendedProjects(studentId: string): Promise<Project[]>;
  
  // Skill gap analysis
  analyzeSkillGap(studentId: string, targetRole: string): Promise<SkillGapAnalysis>;
  
  // Agentic AI operations
  scrapeAndStoreInternships(): Promise<void>;
  getRealTimeInternships(callback: (internships: Internship[]) => void): () => void;
}

export class SupabaseStorage implements IStorage {
  
  async getStudent(id: string): Promise<Student | undefined> {
    try {
      const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching student:', error);
      return undefined;
    }
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    try {
      const result = await db.select().from(students).where(eq(students.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching student by email:', error);
      return undefined;
    }
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    try {
      const result = await db.insert(students).values(insertStudent).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined> {
    try {
      const result = await db
        .update(students)
        .set(updates)
        .where(eq(students.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating student:', error);
      return undefined;
    }
  }

  async getInternships(): Promise<Internship[]> {
    try {
      return await db.select().from(internships).orderBy(desc(internships.id));
    } catch (error) {
      console.error('Error fetching internships:', error);
      return [];
    }
  }

  async searchInternships(query: string, filters?: any): Promise<Internship[]> {
    try {
      let queryBuilder = db.select().from(internships);
      
      if (query) {
        queryBuilder = queryBuilder.where(
          or(
            ilike(internships.title, `%${query}%`),
            ilike(internships.company, `%${query}%`),
            ilike(internships.description, `%${query}%`)
          )
        );
      }

      if (filters) {
        const conditions = [];
        
        if (filters.location) {
          conditions.push(ilike(internships.location, `%${filters.location}%`));
        }
        
        if (filters.minStipend) {
          // Note: This is a simplified filter since stipend is stored as text
          // In production, you'd want to store stipend as numeric for better filtering
          conditions.push(ilike(internships.stipend, `%${filters.minStipend}%`));
        }

        if (conditions.length > 0) {
          queryBuilder = queryBuilder.where(and(...conditions));
        }
      }

      return await queryBuilder.orderBy(desc(internships.id));
    } catch (error) {
      console.error('Error searching internships:', error);
      return [];
    }
  }

  async findInternships(studentId: string): Promise<InternshipWithMatch[]> {
    try {
      const student = await this.getStudent(studentId);
      const allInternships = await this.getInternships();
      
      if (!student) return [];

      const studentSkills = new Set(student.skills || []);

      const internshipsWithMatch = allInternships.map(internship => {
        const matchingSkillCount = (internship.requiredSkills || []).filter(skill => 
          studentSkills.has(skill)
        ).length;
        
        const matchScore = matchingSkillCount;

        return {
          ...internship,
          matchScore: matchScore
        };
      })
      .filter(internship => internship.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

      return internshipsWithMatch;
    } catch (error) {
      console.error('Error finding internships:', error);
      return [];
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      return await db.select().from(projects).orderBy(desc(projects.id));
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async getRecommendedProjects(studentId: string): Promise<Project[]> {
    try {
      const student = await this.getStudent(studentId);
      const allProjects = await this.getProjects();
      
      if (!student || !student.skills || student.skills.length === 0) {
        return allProjects.sort(() => Math.random() - 0.5);
      }

      const studentSkills = new Set(student.skills);

      const scoredProjects = allProjects.map(project => {
        const matchingTechCount = (project.technologies || []).filter(tech => 
          studentSkills.has(tech)
        ).length;
        return { ...project, score: matchingTechCount };
      });

      return scoredProjects.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error getting recommended projects:', error);
      return [];
    }
  }

  async analyzeSkillGap(studentId: string, targetRole: string): Promise<SkillGapAnalysis> {
    try {
      const student = await this.getStudent(studentId);
      
      if (!student) {
        throw new Error("Student not found");
      }

      const studentSkills = new Set(student.skills || []);
      
      // Enhanced role skill maps with more comprehensive requirements
      const roleSkillMaps: Record<string, string[]> = {
        "Full-Stack Developer": ["React", "Node.js", "MongoDB", "JavaScript", "CSS", "HTML", "APIs", "Docker", "Git", "TypeScript"],
        "Frontend Developer": ["React", "JavaScript", "CSS", "HTML", "TypeScript", "Redux", "Next.js", "Tailwind CSS"],
        "Backend Developer": ["Node.js", "Python", "Java", "SQL", "MongoDB", "APIs", "Docker", "AWS", "Express"],
        "Data Scientist": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas", "TensorFlow", "Scikit-learn", "Jupyter"],
        "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Jenkins", "Terraform", "Ansible"],
        "Mobile Developer": ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "Mobile UI/UX"],
        "UI/UX Designer": ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research", "Design Systems"],
        "Product Manager": ["Product Strategy", "User Research", "Data Analysis", "Agile", "JIRA", "SQL"],
      };

      const requiredSkills = new Set(roleSkillMaps[targetRole] || roleSkillMaps["Full-Stack Developer"]);

      const currentSkills = Array.from(studentSkills).filter(skill => requiredSkills.has(skill));
      const missingSkills = Array.from(requiredSkills).filter(skill => !studentSkills.has(skill));

      // Enhanced learning plan with more detailed structure
      const learningPlan = {
        weeks: missingSkills.slice(0, 4).map((skill, index) => ({
          title: `Week ${index + 1}-${index + 2}: ${skill}`,
          focus: skill,
          tasks: [
            `Learn fundamentals of ${skill}`,
            `Complete ${skill} tutorials and exercises`,
            `Build a small project using ${skill}`,
            `Practice ${skill} concepts daily`
          ]
        }))
      };

      return {
        targetRole,
        currentSkills: currentSkills.map(skill => ({ 
          name: skill, 
          level: "Intermediate", 
          proficiency: Math.floor(Math.random() * 40) + 60 // 60-100 range
        })),
        missingSkills: missingSkills.map(skill => ({ 
          name: skill, 
          priority: missingSkills.indexOf(skill) < 3 ? "High" : "Medium", 
          timeToLearn: "2-4 weeks" 
        })),
        learningPlan
      };
    } catch (error) {
      console.error('Error analyzing skill gap:', error);
      throw error;
    }
  }

  // Agentic AI Operations
  async scrapeAndStoreInternships(): Promise<void> {
    try {
      // This will be implemented with Supabase Edge Functions
      // For now, we'll create a placeholder that can be called
      console.log('Starting internship scraping...');
      
      // TODO: Implement actual scraping logic
      // 1. Call Supabase Edge Function to scrape job sites
      // 2. Process and clean the data
      // 3. Store in database with vector embeddings
      
    } catch (error) {
      console.error('Error scraping internships:', error);
      throw error;
    }
  }

  getRealTimeInternships(callback: (internships: Internship[]) => void): () => void {
    try {
      const subscription = supabase
        .channel('internships')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'internships'
          },
          async (payload) => {
            // Fetch updated internships when changes occur
            const updatedInternships = await this.getInternships();
            callback(updatedInternships);
          }
        )
        .subscribe();

      // Return unsubscribe function
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up real-time subscriptions:', error);
      return () => {}; // Return empty function if subscription fails
    }
  }
}

// Export the Supabase storage instance
export const storage = new SupabaseStorage();

// Keep the old MemStorage for fallback/testing
export class MemStorage implements IStorage {
  // ... existing MemStorage implementation remains the same for testing purposes
  private students: Map<string, Student>;
  private internships: Map<string, Internship>;
  private projects: Map<string, Project>;

  constructor() {
    this.students = new Map();
    this.internships = new Map();
    this.projects = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample internships
    const sampleInternships: Internship[] = [
      {
        id: crypto.randomUUID(),
        title: "Frontend Developer Intern",
        company: "TechCorp Solutions",
        location: "Remote",
        stipend: "15000",
        duration: "3-6 months",
        requiredSkills: ["React", "JavaScript", "CSS", "HTML"],
        description: "Build modern web applications using React and JavaScript"
      },
      {
        id: crypto.randomUUID(),
        title: "ML Engineer Intern",
        company: "DataTech Labs",
        location: "Bangalore",
        stipend: "25000",
        duration: "6 months",
        requiredSkills: ["Python", "TensorFlow", "SQL"],
        description: "Work on machine learning projects and data analysis"
      },
      {
        id: crypto.randomUUID(),
        title: "Backend Developer",
        company: "StartupXYZ",
        location: "Remote",
        stipend: "20000",
        duration: "4-6 months",
        requiredSkills: ["Node.js", "MongoDB", "APIs", "Express"],
        description: "Develop scalable backend services and APIs"
      }
    ];

    // Sample projects
    const sampleProjects: Project[] = [
      {
        id: crypto.randomUUID(),
        title: "E-Commerce Dashboard",
        description: "Build a comprehensive admin dashboard for an e-commerce platform with real-time analytics, inventory management, and customer insights using React and Node.js.",
        difficulty: "Intermediate",
        duration: "2-3 weeks",
        technologies: ["React", "Node.js", "MongoDB", "Chart.js"],
        features: ["Real-time sales analytics", "Inventory management system", "Customer behavior insights"]
      },
      {
        id: crypto.randomUUID(),
        title: "AI Chatbot Assistant",
        description: "Create an intelligent chatbot using natural language processing and machine learning. Integrate with popular messaging platforms and implement context-aware conversations.",
        difficulty: "Advanced",
        duration: "4-5 weeks",
        technologies: ["Python", "TensorFlow", "NLP", "Flask"],
        features: ["Natural language understanding", "Context-aware responses", "Multi-platform integration"]
      },
      {
        id: crypto.randomUUID(),
        title: "Personal Finance Tracker",
        description: "Build a comprehensive personal finance management app with expense tracking, budget planning, and financial goal setting using React and local storage.",
        difficulty: "Beginner",
        duration: "1-2 weeks",
        technologies: ["React", "JavaScript", "LocalStorage", "CSS"],
        features: ["Expense categorization", "Budget planning tools", "Visual spending reports"]
      },
    ];

    sampleInternships.forEach(internship => {
      this.internships.set(internship.id, internship);
    });

    sampleProjects.forEach(project => {
      this.projects.set(project.id, project);
    });
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.email === email,
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = crypto.randomUUID();
    const student: Student = { 
      ...insertStudent, 
      id,
      skills: Array.isArray(insertStudent.skills) ? insertStudent.skills as string[] : [],
      interests: Array.isArray(insertStudent.interests) ? insertStudent.interests as string[] : []
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined> {
    const existing = this.students.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...updates,
      skills: Array.isArray(updates.skills) ? updates.skills as string[] : existing.skills,
      interests: Array.isArray(updates.interests) ? updates.interests as string[] : existing.interests
    };
    this.students.set(id, updated);
    return updated;
  }

  async getInternships(): Promise<Internship[]> {
    return Array.from(this.internships.values());
  }

  async findInternships(studentId: string): Promise<InternshipWithMatch[]> {
    const student = await this.getStudent(studentId);
    const internships = await this.getInternships();
    
    if (!student) return [];

    const studentSkills = new Set(student.skills || []);

    return internships.map(internship => {
      const matchingSkillCount = (internship.requiredSkills || []).filter(skill => 
        studentSkills.has(skill)
      ).length;
      
      const matchScore = matchingSkillCount;

      return {
        ...internship,
        matchScore: matchScore
      };
    })
    .filter(internship => internship.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
  }

  async searchInternships(query: string, filters?: any): Promise<Internship[]> {
    const allInternships = await this.getInternships();
    return allInternships.filter(internship => 
      internship.title.toLowerCase().includes(query.toLowerCase()) ||
      internship.company.toLowerCase().includes(query.toLowerCase()) ||
      internship.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getRecommendedProjects(studentId: string): Promise<Project[]> {
    const student = await this.getStudent(studentId);
    const projects = await this.getProjects();
    
    if (!student || !student.skills || student.skills.length === 0) {
      return projects.sort(() => Math.random() - 0.5);
    }

    const studentSkills = new Set(student.skills);

    const scoredProjects = projects.map(project => {
      const matchingTechCount = (project.technologies || []).filter(tech => 
        studentSkills.has(tech)
      ).length;
      return { ...project, score: matchingTechCount };
    });

    return scoredProjects.sort((a, b) => b.score - a.score);
  }

  async analyzeSkillGap(studentId: string, targetRole: string): Promise<SkillGapAnalysis> {
    const student = await this.getStudent(studentId);
    
    if (!student) {
      throw new Error("Student not found");
    }

    const studentSkills = new Set(student.skills || []);
    
    const roleSkillMaps: Record<string, string[]> = {
      "Full-Stack Developer": ["React", "Node.js", "MongoDB", "JavaScript", "CSS", "APIs", "Docker"],
      "Data Scientist": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas", "TensorFlow"],
      "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
    };

    const requiredSkills = new Set(roleSkillMaps[targetRole] || roleSkillMaps["Full-Stack Developer"]);

    const currentSkills = Array.from(studentSkills).filter(skill => requiredSkills.has(skill));
    const missingSkills = Array.from(requiredSkills).filter(skill => !studentSkills.has(skill));

    const learningPlan = {
      weeks: [
        {
          title: "Week 1-2: Core Concepts",
          focus: missingSkills[0] || "Key Skill 1",
          tasks: [`Learn basics of ${missingSkills[0]}`, `Build a small project with ${missingSkills[0]}`]
        },
        {
          title: "Week 3-4: Advanced Topics",
          focus: missingSkills[1] || "Key Skill 2",
          tasks: [`Deep dive into ${missingSkills[1]}`, `Integrate ${missingSkills[1]} with other tech`]
        },
      ]
    };

    return {
      targetRole,
      currentSkills: currentSkills.map(skill => ({ name: skill, level: "Intermediate", proficiency: 60 })),
      missingSkills: missingSkills.map(skill => ({ name: skill, priority: "High", timeToLearn: "2-4 weeks" })),
      learningPlan
    };
  }

  async scrapeAndStoreInternships(): Promise<void> {
    console.log('Scraping internships (mock implementation)');
  }

  getRealTimeInternships(callback: (internships: Internship[]) => void): () => void {
    // Mock implementation for in-memory storage
    return () => {};
  }
}
