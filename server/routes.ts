import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for React frontend
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Onboarding endpoint
  app.post("/api/onboard", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.json({ success: true, student });
    } catch (error) {
      console.error("Onboarding error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof z.ZodError ? error.errors : "Invalid student data" 
      });
    }
  });

  // Update student profile (for multi-step onboarding)
  app.put("/api/student/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const student = await storage.updateStudent(id, updates);
      
      if (!student) {
        return res.status(404).json({ success: false, error: "Student not found" });
      }
      
      res.json({ success: true, student });
    } catch (error) {
      console.error("Update student error:", error);
      res.status(400).json({ success: false, error: "Failed to update student" });
    }
  });

  // Get student by email
  app.get("/api/student/email/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const student = await storage.getStudentByEmail(email);
      
      if (!student) {
        return res.status(404).json({ success: false, error: "Student not found" });
      }
      
      res.json({ success: true, student });
    } catch (error) {
      console.error("Get student error:", error);
      res.status(500).json({ success: false, error: "Failed to get student" });
    }
  });

  // Find internships for a student (GET by studentId) - existing route
  app.get("/api/find-internships/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const internships = await storage.findInternships(studentId);
      res.json({ success: true, internships });
    } catch (error) {
      console.error("Find internships error:", error);
      res.status(500).json({ success: false, error: "Failed to find internships" });
    }
  });

  // **NEW**: Find internships by profile or filters (POST)
  // Accepts:
  //  - { studentId }  -> returns stored matches using storage.findInternships(studentId)
  //  - { profile, filters } -> on-the-fly matching against storage.getInternships()
  //  - no body -> returns all internships
  app.post("/api/find-internships", async (req, res) => {
    try {
      const body = req.body || {};
      const { studentId, profile, filters } = body;

      // 1) If studentId provided, reuse existing matching logic
      if (studentId) {
        const internships = await storage.findInternships(studentId);
        return res.json({ success: true, internships });
      }

      // 2) If profile provided, perform simple on-the-fly matching against stored internships
      if (profile) {
        const all = await storage.getInternships();
        const profileSkills: string[] = (profile.skills || []).map((s: string) => s.toLowerCase());

        const mapped = (all || []).map((intern: any) => {
          const required = (intern.requiredSkills || []).map((s: string) => s.toLowerCase());
          // Count matching skills (simple contains match)
          const matchingSkills = profileSkills.filter((ps) =>
            required.some((r: string) => r.includes(ps) || ps.includes(r))
          );
          const score = required.length > 0 ? Math.round((matchingSkills.length / required.length) * 100) / 100 : 0;
          return { ...intern, score };
        });

        // Optional filters: location and remote
        let filtered = mapped;
        if (filters) {
          if (filters.location) {
            filtered = filtered.filter((j: any) =>
              (j.location || "").toLowerCase().includes(String(filters.location).toLowerCase())
            );
          }
          if (filters.remote !== undefined) {
            filtered = filtered.filter((j: any) =>
              filters.remote ? (String(j.location || "").toLowerCase().includes("remote")) : true
            );
          }
        }

        filtered.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
        return res.json({ success: true, internships: filtered });
      }

      // 3) No body — return all internships
      const internships = await storage.getInternships();
      res.json({ success: true, internships });
    } catch (error) {
      console.error("Find internships (POST) error:", error);
      res.status(500).json({ success: false, error: "Failed to find internships" });
    }
  });

  // Get all internships (for filtering)
  app.get("/api/internships", async (req, res) => {
    try {
      const internships = await storage.getInternships();
      res.json({ success: true, internships });
    } catch (error) {
      console.error("Get internships error:", error);
      res.status(500).json({ success: false, error: "Failed to get internships" });
    }
  });

  // Skill gap analysis
  app.post("/api/skill-gap", async (req, res) => {
    try {
      const { studentId, targetRole } = req.body;
      
      if (!studentId || !targetRole) {
        return res.status(400).json({ 
          success: false, 
          error: "Student ID and target role are required" 
        });
      }
      
      const analysis = await storage.analyzeSkillGap(studentId, targetRole);
      res.json({ success: true, analysis });
    } catch (error) {
      console.error("Skill gap analysis error:", error);
      res.status(500).json({ success: false, error: "Failed to analyze skill gap" });
    }
  });

  // Get project recommendations (by student)
  app.get("/api/projects/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const projects = await storage.getRecommendedProjects(studentId);
      res.json({ success: true, projects });
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ success: false, error: "Failed to get projects" });
    }
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json({ success: true, projects });
    } catch (error) {
      console.error("Get all projects error:", error);
      res.status(500).json({ success: false, error: "Failed to get projects" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
