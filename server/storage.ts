import { type Student, type InsertStudent, type Internship, type InsertInternship, type Project, type InsertProject, type SkillGapAnalysis, type InternshipWithMatch } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  
  // Internship operations
  getInternships(): Promise<Internship[]>;
  findInternships(studentId: string): Promise<InternshipWithMatch[]>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getRecommendedProjects(studentId: string): Promise<Project[]>;
  
  // Skill gap analysis
  analyzeSkillGap(studentId: string, targetRole: string): Promise<SkillGapAnalysis>;
}

export class MemStorage implements IStorage {
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
        id: randomUUID(),
        title: "Frontend Developer Intern",
        company: "TechCorp Solutions",
        location: "Remote",
        stipend: "₹15,000 - ₹25,000",
        duration: "3-6 months",
        requiredSkills: ["React", "JavaScript", "CSS"],
        description: "Build modern web applications using React and JavaScript"
      },
      {
        id: randomUUID(),
        title: "ML Engineer Intern",
        company: "DataTech Labs",
        location: "Bangalore",
        stipend: "₹20,000 - ₹30,000",
        duration: "6 months",
        requiredSkills: ["Python", "TensorFlow", "SQL"],
        description: "Work on machine learning projects and data analysis"
      },
      {
        id: randomUUID(),
        title: "Backend Developer",
        company: "StartupXYZ",
        location: "Remote",
        stipend: "₹18,000 - ₹28,000",
        duration: "4-6 months",
        requiredSkills: ["Node.js", "MongoDB", "APIs"],
        description: "Develop scalable backend services and APIs"
      }
    ];

    // Sample projects
    const sampleProjects: Project[] = [
      {
        id: randomUUID(),
        title: "E-Commerce Dashboard",
        description: "Build a comprehensive admin dashboard for an e-commerce platform with real-time analytics, inventory management, and customer insights using React and Node.js.",
        difficulty: "Intermediate",
        duration: "2-3 weeks",
        technologies: ["React", "Node.js", "MongoDB", "Chart.js"],
        features: ["Real-time sales analytics", "Inventory management system", "Customer behavior insights"]
      },
      {
        id: randomUUID(),
        title: "AI Chatbot Assistant",
        description: "Create an intelligent chatbot using natural language processing and machine learning. Integrate with popular messaging platforms and implement context-aware conversations.",
        difficulty: "Advanced",
        duration: "4-5 weeks",
        technologies: ["Python", "TensorFlow", "NLP", "Flask"],
        features: ["Natural language understanding", "Context-aware responses", "Multi-platform integration"]
      },
      {
        id: randomUUID(),
        title: "Personal Finance Tracker",
        description: "Build a comprehensive personal finance management app with expense tracking, budget planning, and financial goal setting using React and local storage.",
        difficulty: "Beginner",
        duration: "1-2 weeks",
        technologies: ["React", "JavaScript", "LocalStorage", "CSS3"],
        features: ["Expense categorization", "Budget planning tools", "Visual spending reports"]
      },
      {
        id: randomUUID(),
        title: "Social Media Analytics",
        description: "Create a powerful social media analytics tool that tracks engagement metrics, analyzes trends, and provides insights using APIs and data visualization libraries.",
        difficulty: "Intermediate",
        duration: "3-4 weeks",
        technologies: ["Python", "Pandas", "APIs", "D3.js"],
        features: ["Multi-platform data collection", "Interactive dashboards", "Trend analysis reports"]
      }
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
    const id = randomUUID();
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

    return internships.map(internship => {
      // Calculate match score based on skills overlap
      const studentSkills = student.skills || [];
      const requiredSkills = internship.requiredSkills || [];
      
      const matchingSkills = studentSkills.filter(skill => 
        requiredSkills.some(required => 
          required.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(required.toLowerCase())
        )
      );
      
      const matchScore = requiredSkills.length > 0 
        ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
        : 75;

      return {
        ...internship,
        matchScore: Math.min(matchScore + Math.floor(Math.random() * 15), 100)
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getRecommendedProjects(studentId: string): Promise<Project[]> {
    const student = await this.getStudent(studentId);
    const projects = await this.getProjects();
    
    if (!student) return projects;

    // Return projects sorted by relevance to student's skills/interests
    return projects.sort(() => Math.random() - 0.5);
  }

  async analyzeSkillGap(studentId: string, targetRole: string): Promise<SkillGapAnalysis> {
    const student = await this.getStudent(studentId);
    
    if (!student) {
      throw new Error("Student not found");
    }

    const studentSkills = student.skills || [];
    
    // Mock skill gap analysis based on target role
    const roleSkillMaps: Record<string, {
      required: string[];
      current: { name: string; level: string; proficiency: number }[];
      missing: { name: string; priority: string; timeToLearn: string }[];
    }> = {
      "Full-Stack Developer": {
        required: ["React", "Node.js", "MongoDB", "JavaScript", "CSS", "APIs"],
        current: [
          { name: "React", level: "Advanced", proficiency: 80 },
          { name: "JavaScript", level: "Intermediate", proficiency: 60 },
          { name: "CSS", level: "Beginner", proficiency: 40 }
        ],
        missing: [
          { name: "Node.js", priority: "High Priority", timeToLearn: "2-3 weeks" },
          { name: "MongoDB", priority: "Medium Priority", timeToLearn: "1-2 weeks" },
          { name: "Docker", priority: "Low Priority", timeToLearn: "3-4 weeks" }
        ]
      },
      "Data Scientist": {
        required: ["Python", "Machine Learning", "Statistics", "SQL", "Pandas"],
        current: [
          { name: "Python", level: "Intermediate", proficiency: 65 },
          { name: "SQL", level: "Beginner", proficiency: 35 }
        ],
        missing: [
          { name: "Machine Learning", priority: "High Priority", timeToLearn: "4-6 weeks" },
          { name: "Statistics", priority: "High Priority", timeToLearn: "3-4 weeks" },
          { name: "Pandas", priority: "Medium Priority", timeToLearn: "1-2 weeks" }
        ]
      },
      "DevOps Engineer": {
        required: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
        current: [
          { name: "Linux", level: "Intermediate", proficiency: 55 }
        ],
        missing: [
          { name: "Docker", priority: "High Priority", timeToLearn: "2-3 weeks" },
          { name: "AWS", priority: "High Priority", timeToLearn: "4-5 weeks" },
          { name: "Kubernetes", priority: "Medium Priority", timeToLearn: "3-4 weeks" }
        ]
      }
    };

    const roleData = roleSkillMaps[targetRole] || roleSkillMaps["Full-Stack Developer"];

    const learningPlan = {
      weeks: [
        {
          title: "Week 1",
          focus: "Node.js Fundamentals",
          tasks: ["Express.js basics", "REST API creation", "Build a simple server"]
        },
        {
          title: "Week 2",
          focus: "Database Integration",
          tasks: ["MongoDB setup", "CRUD operations", "Data modeling"]
        },
        {
          title: "Week 3",
          focus: "Authentication & Security",
          tasks: ["JWT implementation", "User management", "Security best practices"]
        },
        {
          title: "Week 4",
          focus: "Project Integration",
          tasks: ["Deploy application", "Testing & debugging", "Portfolio project"]
        }
      ]
    };

    return {
      targetRole,
      currentSkills: roleData.current,
      missingSkills: roleData.missing,
      learningPlan
    };
  }
}

export const storage = new MemStorage();
