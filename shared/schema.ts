import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  title: text("title"),
  about: text("about"),
  location: text("location"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow()
});

// Resume table
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  fileSize: text("file_size").notNull(),
  fileType: text("file_type").notNull(),
  content: text("content"),
  uploadDate: timestamp("upload_date").defaultNow(),
  extractedSkills: text("extracted_skills").array()
});

// Skills table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category")
});

// UserSkills table (many-to-many)
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  level: text("level")
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  salary: text("salary"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  requiredSkills: text("required_skills").array(),
  postedDate: timestamp("posted_date").defaultNow()
});

// JobApplications table
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  status: text("status").notNull(),
  applicationDate: timestamp("application_date").defaultNow(),
  coverLetter: text("cover_letter")
});

// SavedJobs table
export const savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  savedDate: timestamp("saved_date").defaultNow()
});

// Portfolio table
export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration"),
  skills: text("skills"),
  createdAt: timestamp("created_at").defaultNow()
});

// OptimizationSuggestions table
export const optimizationSuggestions = pgTable("optimization_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  implemented: boolean("implemented").default(false)
});

// Schema validations for inserts
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, uploadDate: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertUserSkillSchema = createInsertSchema(userSkills).omit({ id: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, postedDate: true });
export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({ id: true, applicationDate: true });
export const insertSavedJobSchema = createInsertSchema(savedJobs).omit({ id: true, savedDate: true });
export const insertPortfolioSchema = createInsertSchema(portfolio).omit({ id: true, createdAt: true });
export const insertOptimizationSuggestionSchema = createInsertSchema(optimizationSuggestions).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;
export type UserSkill = typeof userSkills.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;
export type SavedJob = typeof savedJobs.$inferSelect;

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolio.$inferSelect;

export type InsertOptimizationSuggestion = z.infer<typeof insertOptimizationSuggestionSchema>;
export type OptimizationSuggestion = typeof optimizationSuggestions.$inferSelect;
