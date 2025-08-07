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
        stipend: "15000", // Storing stipend as a number makes it easier to filter
        duration: "3-6 months",
        requiredSkills: ["React", "JavaScript", "CSS", "HTML"],
        description: "Build modern web applications using React and JavaScript"
      },
      {
        id: randomUUID(),
        title: "ML Engineer Intern",
        company: "DataTech Labs",
        location: "Bangalore",
        stipend: "25000",
        duration: "6 months",
        requiredSkills: ["Python", "TensorFlow", "SQL"],
        description: "Work on machine learning projects and data analysis"
      },
      {
        id: randomUUID(),
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
    const id = randomUUID();
    const student: Student = { 
      ...insertStudent, 
      id,
      // Ensure skills and interests are always arrays
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

  // --- LOGIC IMPROVEMENT 1: Simplified and more accurate internship matching ---
  async findInternships(studentId: string): Promise<InternshipWithMatch[]> {
    const student = await this.getStudent(studentId);
    const internships = await this.getInternships();
    
    if (!student) return [];

    // Using a Set for student skills provides faster lookups (O(1) average time complexity)
    const studentSkills = new Set(student.skills || []);

    return internships.map(internship => {
      // Calculate a simple, direct match score.
      // For each required skill, check if the student has it.
      const matchingSkillCount = (internship.requiredSkills || []).filter(skill => 
        studentSkills.has(skill)
      ).length;
      
      // The score is the number of matching skills.
      const matchScore = matchingSkillCount;

      return {
        ...internship,
        matchScore: matchScore
      };
    })
    // Filter out internships with no matching skills and then sort by the score.
    .filter(internship => internship.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  // --- LOGIC IMPROVEMENT 2: Smarter project recommendations ---
  async getRecommendedProjects(studentId: string): Promise<Project[]> {
    const student = await this.getStudent(studentId);
    const projects = await this.getProjects();
    
    if (!student || !student.skills || student.skills.length === 0) {
        // If no student or skills, return a random list
        return projects.sort(() => Math.random() - 0.5);
    }

    const studentSkills = new Set(student.skills);

    // Score projects based on technology overlap
    const scoredProjects = projects.map(project => {
        const matchingTechCount = (project.technologies || []).filter(tech => 
            studentSkills.has(tech)
        ).length;
        return { ...project, score: matchingTechCount };
    });

    // Sort projects by the score, highest first
    return scoredProjects.sort((a, b) => b.score - a.score);
  }

  // --- LOGIC IMPROVEMENT 3: Dynamic skill gap analysis ---
  async analyzeSkillGap(studentId: string, targetRole: string): Promise<SkillGapAnalysis> {
    const student = await this.getStudent(studentId);
    
    if (!student) {
      throw new Error("Student not found");
    }

    const studentSkills = new Set(student.skills || []);
    
    // Mock skill requirements for different roles
    const roleSkillMaps: Record<string, string[]> = {
      "Full-Stack Developer": ["React", "Node.js", "MongoDB", "JavaScript", "CSS", "APIs", "Docker"],
      "Data Scientist": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas", "TensorFlow"],
      "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
    };

    const requiredSkills = new Set(roleSkillMaps[targetRole] || roleSkillMaps["Full-Stack Developer"]);

    // Dynamically determine current and missing skills based on the student's profile
    const currentSkills = Array.from(studentSkills).filter(skill => requiredSkills.has(skill));
    const missingSkills = Array.from(requiredSkills).filter(skill => !studentSkills.has(skill));

    // Mock learning plan (can be made more dynamic later)
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
}

export const storage = new MemStorage();
