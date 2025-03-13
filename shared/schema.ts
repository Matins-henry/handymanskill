import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  bio: text("bio"),
  location: text("location"),
  phone: text("phone"),
  avatar: text("avatar"),
  yearsOfExperience: integer("yearsofexperience"),
  skills: text("skills").array(),
  memberSince: timestamp("membersince").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Resumes table
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("userid").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  fileType: text("filetype").notNull(),
  filePath: text("filepath").notNull(),
  uploadedAt: timestamp("uploadedat").defaultNow(),
  skillsExtracted: text("skillsextracted").array(),
  experienceYears: integer("experienceyears"),
  matchRate: integer("matchrate"),
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  userId: true,
  filename: true,
  fileType: true,
  filePath: true,
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  skills: text("skills").array().notNull(),
  categories: text("categories").array(),
  employmentType: text("employmenttype").notNull(),
  salary: text("salary").notNull(),
  contactEmail: text("contactemail"),
  contactPhone: text("contactphone"),
  postedAt: timestamp("postedat").defaultNow(),
  responsibilities: text("responsibilities").array(),
  requirements: text("requirements").array(),
  benefits: text("benefits").array(),
  coordinates: jsonb("coordinates"),
  isActive: boolean("isactive").default(true),
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  company: true, 
  location: true,
  description: true,
  skills: true,
  categories: true,
  employmentType: true,
  salary: true,
  contactEmail: true,
  contactPhone: true,
  responsibilities: true,
  requirements: true,
  benefits: true,
  coordinates: true,
});

// Portfolio projects table
export const portfolioProjects = pgTable("portfolioprojects", {
  id: serial("id").primaryKey(),
  userId: integer("userid").notNull().references(() => users.id),
  title: text("title").notNull(),
  projectType: text("projecttype").notNull(),
  description: text("description").notNull(),
  skills: text("skills").array(),
  images: text("images").array(),
  createdAt: timestamp("createdat").defaultNow(),
});

export const insertPortfolioProjectSchema = createInsertSchema(portfolioProjects).pick({
  userId: true,
  title: true,
  projectType: true,
  description: true,
  skills: true,
  images: true,
});

// Applications table (for job applications)
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("userid").notNull().references(() => users.id),
  jobId: integer("jobid").notNull().references(() => jobs.id),
  status: text("status").notNull().default("pending"),
  coverLetter: text("coverletter"),
  resumeId: integer("resumeid").references(() => resumes.id),
  appliedAt: timestamp("appliedat").defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  userId: true,
  jobId: true,
  coverLetter: true,
  resumeId: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type InsertPortfolioProject = z.infer<typeof insertPortfolioProjectSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
