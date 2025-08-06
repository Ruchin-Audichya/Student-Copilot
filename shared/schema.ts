import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  year: integer("year").notNull(),
  skills: jsonb("skills").$type<string[]>().default([]),
  interests: jsonb("interests").$type<string[]>().default([]),
});

export const internships = pgTable("internships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  stipend: text("stipend").notNull(),
  duration: text("duration").notNull(),
  requiredSkills: jsonb("required_skills").$type<string[]>().default([]),
  description: text("description").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  duration: text("duration").notNull(),
  technologies: jsonb("technologies").$type<string[]>().default([]),
  features: jsonb("features").$type<string[]>().default([]),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertInternshipSchema = createInsertSchema(internships).omit({
  id: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type Internship = typeof internships.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Skill gap analysis types
export type SkillGapAnalysis = {
  targetRole: string;
  currentSkills: { name: string; level: string; proficiency: number }[];
  missingSkills: { name: string; priority: string; timeToLearn: string }[];
  learningPlan: {
    weeks: {
      title: string;
      focus: string;
      tasks: string[];
    }[];
  };
};

// Internship with match score
export type InternshipWithMatch = Internship & {
  matchScore: number;
};
