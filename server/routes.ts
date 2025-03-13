import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertUserSchema, insertResumeSchema, insertPortfolioProjectSchema, insertApplicationSchema } from "@shared/schema";
import { parseResume, extractSkills } from "./services/resumeParser";
import { matchJobsToSkills, calculateMatchPercentage } from "./services/jobMatcher";
import { storeFile, getFilePath } from "./services/fileStorage";
import { authenticateUser, hashPassword, comparePassword, requireAuth } from "./middlewares/auth";
import multer from "multer";
import path from "path";
import session from "express-session";

// Extend the Express Request type to include session
declare module "express-session" {
  interface SessionData {
    userId: number | null;
  }
}

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX are allowed."));
    }
  }
});

// Function to handle API errors
const handleError = (res: Response, error: unknown) => {
  console.error("API Error:", error);
  
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return res.status(400).json({ 
      success: false,
      message: validationError.message 
    });
  }
  
  if (error instanceof Error) {
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
  
  return res.status(500).json({ 
    success: false,
    message: "An unknown error occurred" 
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Session is now handled by express-session in index.ts

  // ==========================================
  // Authentication Routes
  // ==========================================
  
  // Register a new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: "Username already exists" 
        });
      }
      
      // Hash password before storing
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      // Set user in session
      (req as any).session.userId = user.id;
      
      return res.status(201).json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Login user
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginSchema = z.object({
        username: z.string(),
        password: z.string()
      });
      
      const credentials = loginSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(credentials.username);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid username or password" 
        });
      }
      
      // Check password
      const isValidPassword = await comparePassword(credentials.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid username or password" 
        });
      }
      
      // Set user in session
      (req as any).session.userId = user.id;
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      return res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Logout user
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    (req as any).session.userId = null;
    return res.json({ success: true });
  });
  
  // Get current user profile
  app.get("/api/user/profile", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      // Get user's resume if available
      const resumes = await storage.getResumesByUserId(userId);
      const latestResume = resumes.length > 0 
        ? resumes.sort((a, b) => {
            const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
            const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
            return dateB - dateA;
          })[0] 
        : null;
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      return res.json({
        ...userWithoutPassword,
        resumeId: latestResume?.id || null,
        resume: latestResume ? {
          id: latestResume.id,
          filename: latestResume.filename,
          uploadedAt: latestResume.uploadedAt
        } : null
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Update user profile
  app.patch("/api/user/profile", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      
      const updateSchema = z.object({
        username: z.string().optional(),
        email: z.string().email().optional(),
        bio: z.string().max(160).optional(),
        location: z.string().optional(),
        phone: z.string().optional(),
        yearsOfExperience: z.string().transform(val => parseInt(val, 10)).optional(),
      });
      
      const updateData = updateSchema.parse(req.body);
      
      // Check if username is already taken
      if (updateData.username) {
        const existingUser = await storage.getUserByUsername(updateData.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ 
            success: false,
            message: "Username is already taken" 
          });
        }
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Update user password
  app.patch("/api/user/password", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      
      const passwordSchema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8)
      });
      
      const passwordData = passwordSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      // Verify current password
      const isValidPassword = await comparePassword(passwordData.currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          message: "Current password is incorrect" 
        });
      }
      
      // Hash and update the new password
      const hashedPassword = await hashPassword(passwordData.newPassword);
      
      await storage.updateUser(userId, { password: hashedPassword });
      
      return res.json({ success: true });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Upload user avatar
  app.post("/api/user/avatar", authenticateUser, upload.single("avatar"), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: "No file uploaded" 
        });
      }
      
      // Store the file with a unique name
      const filename = `avatar_${userId}_${Date.now()}${path.extname(req.file.originalname)}`;
      const filePath = await storeFile(filename, req.file.buffer);
      
      // Update user with avatar path
      const updatedUser = await storage.updateUser(userId, { avatar: filePath });
      
      if (!updatedUser) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      return res.json({ 
        success: true,
        avatar: filePath
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // ==========================================
  // Resume Upload and Processing Routes
  // ==========================================
  
  // Upload resume
  app.post("/api/resume/upload", authenticateUser, upload.single("resume"), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: "No file uploaded" 
        });
      }
      
      // Store the file with a unique name
      const filename = `resume_${userId}_${Date.now()}${path.extname(req.file.originalname)}`;
      const filePath = await storeFile(filename, req.file.buffer);
      
      // Create resume record
      const resume = await storage.createResume({
        userId,
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        filePath
      });
      
      // Process the resume asynchronously
      parseResume(filePath, req.file.mimetype)
        .then(async (parsedText) => {
          const { skills, years } = extractSkills(parsedText);
          
          // Update resume with extracted skills
          await storage.updateResume(resume.id, {
            skillsExtracted: skills,
            experienceYears: years
          });
          
          // Update user skills
          const user = await storage.getUser(userId);
          if (user) {
            await storage.updateUser(userId, {
              skills: Array.from(new Set([...(user.skills || []), ...skills])),
              yearsOfExperience: years || user.yearsOfExperience
            });
          }
        })
        .catch(error => console.error("Resume parsing error:", error));
      
      return res.status(201).json({
        success: true,
        fileId: resume.id,
        fileName: resume.filename,
        fileType: resume.fileType
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Get resume analysis
  app.get("/api/resume/parse/:fileId", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const fileId = parseInt(req.params.fileId);
      
      if (isNaN(fileId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid file ID" 
        });
      }
      
      const resume = await storage.getResume(fileId);
      
      if (!resume) {
        return res.status(404).json({ 
          success: false,
          message: "Resume not found" 
        });
      }
      
      // Check if this resume belongs to the current user
      if (resume.userId !== userId) {
        return res.status(403).json({ 
          success: false,
          message: "You don't have permission to access this resume" 
        });
      }
      
      if (!resume.skillsExtracted || resume.skillsExtracted.length === 0) {
        // If skills haven't been extracted yet, do it now
        const filePath = await getFilePath(resume.filePath);
        const parsedText = await parseResume(filePath, resume.fileType);
        const { skills, years } = extractSkills(parsedText);
        
        // Update resume with extracted skills
        await storage.updateResume(resume.id, {
          skillsExtracted: skills,
          experienceYears: years
        });
        
        // Update user skills
        const user = await storage.getUser(userId);
        if (user) {
          await storage.updateUser(userId, {
            skills: Array.from(new Set([...(user.skills || []), ...skills])),
            yearsOfExperience: years || user.yearsOfExperience
          });
        }
        
        return res.json({
          skills: skills,
          experience: {
            years: years,
            positions: []
          },
          education: [],
          success: true
        });
      }
      
      return res.json({
        skills: resume.skillsExtracted,
        experience: {
          years: resume.experienceYears,
          positions: []
        },
        education: [],
        success: true
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Get resume skills matches
  app.get("/api/resume/skills/:fileId", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const fileId = parseInt(req.params.fileId);
      
      if (isNaN(fileId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid file ID" 
        });
      }
      
      const resume = await storage.getResume(fileId);
      
      if (!resume) {
        return res.status(404).json({ 
          success: false,
          message: "Resume not found" 
        });
      }
      
      // Check if this resume belongs to the current user
      if (resume.userId !== userId) {
        return res.status(403).json({ 
          success: false,
          message: "You don't have permission to access this resume" 
        });
      }
      
      // Get skills from resume
      let skills = resume.skillsExtracted || [];
      let years = resume.experienceYears || 0;
      
      // If skills haven't been extracted yet, get them from the user
      if (skills.length === 0) {
        const user = await storage.getUser(userId);
        if (user) {
          skills = user.skills || [];
          years = user.yearsOfExperience || 0;
        }
      }
      
      // Classify skills as primary or secondary
      const primarySkills = skills.slice(0, Math.min(5, skills.length));
      const secondarySkills = skills.slice(Math.min(5, skills.length));
      
      // Calculate experience level based on years
      let experienceLevel = 0;
      if (years <= 1) experienceLevel = 20;
      else if (years <= 3) experienceLevel = 40;
      else if (years <= 5) experienceLevel = 60;
      else if (years <= 10) experienceLevel = 80;
      else experienceLevel = 95;
      
      // Resume improvement suggestions
      const suggestions = [
        "Add more specific project examples to showcase your skills",
        "Include certifications or training in your field",
        "Quantify your achievements (e.g., completed projects on time/under budget)"
      ];
      
      // Calculate match rate (this would be more sophisticated in a real app)
      const matchRate = 80 + Math.floor(Math.random() * 20); // 80-99%
      
      return res.json({
        primary: primarySkills,
        secondary: secondarySkills,
        experienceYears: years,
        experienceLevel,
        suggestions,
        matchRate
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // ==========================================
  // Jobs Routes
  // ==========================================
  
  // Get all jobs with optional filtering
  app.get("/api/jobs", async (req: Request, res: Response) => {
    try {
      const skills = req.query.skills ? 
        Array.isArray(req.query.skills) ? 
          req.query.skills as string[] : 
          [req.query.skills as string] : 
        undefined;
      
      const location = req.query.location as string | undefined;
      const radius = req.query.radius as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const jobs = await storage.getJobs({
        skills,
        location,
        radius,
        limit,
        offset
      });
      
      // Add additional fields needed by the frontend
      const enhancedJobs = jobs.map(job => {
        // Calculate distance (would use geocoding in a real app)
        const distance = `${(Math.random() * 10).toFixed(1)} miles`;
        
        // Format posted time
        const postedDaysAgo = job.postedAt ? Math.floor((Date.now() - job.postedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const postedTime = postedDaysAgo === 0 ? 'Today' : 
                           postedDaysAgo === 1 ? 'Yesterday' : 
                           `${postedDaysAgo} days ago`;
        
        // Calculate match percentage with current user's skills
        // In a real app, this would use the authenticated user's skills
        // For demo purposes, we'll use a random high percentage
        const matchPercentage = Math.floor(80 + Math.random() * 19); // 80-99%
        
        return {
          ...job,
          distance,
          postedTime,
          matchPercentage
        };
      });
      
      return res.json(enhancedJobs);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Get a specific job
  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid job ID" 
        });
      }
      
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ 
          success: false,
          message: "Job not found" 
        });
      }
      
      // Calculate distance (would use geocoding in a real app)
      const distance = `${(Math.random() * 10).toFixed(1)} miles`;
      
      // Format posted time
      const postedDaysAgo = job.postedAt ? Math.floor((Date.now() - job.postedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const postedTime = postedDaysAgo === 0 ? 'Today' : 
                         postedDaysAgo === 1 ? 'Yesterday' : 
                         `${postedDaysAgo} days ago`;
      
      // Get user's skills if authenticated
      let userSkills: string[] = [];
      let matchPercentage = 85; // Default match percentage
      
      if ((req as any).userId) {
        const user = await storage.getUser((req as any).userId);
        if (user && user.skills) {
          userSkills = user.skills;
          matchPercentage = calculateMatchPercentage(job.skills, userSkills);
        }
      }
      
      // Determine which skills match the user's skills
      const matchingSkills = job.skills
        .filter(skill => userSkills.includes(skill))
        .map(skill => ({
          name: skill,
          match: 85 + Math.floor(Math.random() * 15) // 85-100%
        }));
      
      // Determine missing skills
      const missingSkills = job.skills.filter(skill => !userSkills.includes(skill));
      
      return res.json({
        ...job,
        distance,
        postedTime,
        matchPercentage,
        matchingSkills,
        missingSkills,
        fullAddress: `${job.location} (${distance})`,
        startDate: "Immediate"
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // ==========================================
  // Portfolio Routes
  // ==========================================
  
  // Get user's portfolio projects
  app.get("/api/portfolio/projects", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      
      const projects = await storage.getPortfolioProjectsByUserId(userId);
      
      return res.json(projects);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Create a new portfolio project
  app.post("/api/portfolio/project", authenticateUser, upload.array("images", 5), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      
      const projectSchema = z.object({
        title: z.string().min(2),
        projectType: z.string(),
        description: z.string().min(10)
      });
      
      const projectData = projectSchema.parse(req.body);
      
      // Process and store images
      const images = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const filename = `project_${userId}_${Date.now()}_${images.length}${path.extname(file.originalname)}`;
          const filePath = await storeFile(filename, file.buffer);
          images.push(filePath);
        }
      }
      
      // Determine skills based on project type
      let skills: string[] = [];
      switch (projectData.projectType) {
        case "Carpentry":
          skills = ["Carpentry", "Woodworking"];
          break;
        case "Plumbing":
          skills = ["Plumbing", "Pipe Fitting"];
          break;
        case "Electrical":
          skills = ["Electrical", "Wiring"];
          break;
        case "Painting":
          skills = ["Painting", "Finishing"];
          break;
        case "Renovation":
          skills = ["Renovation", "Remodeling"];
          break;
        default:
          skills = [projectData.projectType];
      }
      
      const project = await storage.createPortfolioProject({
        userId,
        title: projectData.title,
        projectType: projectData.projectType,
        description: projectData.description,
        skills,
        images
      });
      
      return res.status(201).json({
        success: true,
        project
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Update a portfolio project
  app.patch("/api/portfolio/project/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid project ID" 
        });
      }
      
      const project = await storage.getPortfolioProject(projectId);
      
      if (!project) {
        return res.status(404).json({ 
          success: false,
          message: "Project not found" 
        });
      }
      
      // Check if this project belongs to the current user
      if (project.userId !== userId) {
        return res.status(403).json({ 
          success: false,
          message: "You don't have permission to update this project" 
        });
      }
      
      const updateSchema = z.object({
        title: z.string().min(2).optional(),
        projectType: z.string().optional(),
        description: z.string().min(10).optional(),
        skills: z.array(z.string()).optional(),
      });
      
      const updateData = updateSchema.parse(req.body);
      
      const updatedProject = await storage.updatePortfolioProject(projectId, updateData);
      
      return res.json({
        success: true,
        project: updatedProject
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Delete a portfolio project
  app.delete("/api/portfolio/project/:id", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid project ID" 
        });
      }
      
      const project = await storage.getPortfolioProject(projectId);
      
      if (!project) {
        return res.status(404).json({ 
          success: false,
          message: "Project not found" 
        });
      }
      
      // Check if this project belongs to the current user
      if (project.userId !== userId) {
        return res.status(403).json({ 
          success: false,
          message: "You don't have permission to delete this project" 
        });
      }
      
      await storage.deletePortfolioProject(projectId);
      
      return res.json({
        success: true
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // ==========================================
  // Job Application Routes
  // ==========================================
  
  // Apply for a job
  app.post("/api/jobs/:id/apply", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid job ID" 
        });
      }
      
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ 
          success: false,
          message: "Job not found" 
        });
      }
      
      const applicationSchema = z.object({
        coverLetter: z.string().optional(),
        resumeId: z.number().optional()
      });
      
      const applicationData = applicationSchema.parse(req.body);
      
      // Check if user has already applied for this job
      const existingApplications = await storage.getApplicationsByUserId(userId);
      const alreadyApplied = existingApplications.some(app => app.jobId === jobId);
      
      if (alreadyApplied) {
        return res.status(409).json({ 
          success: false,
          message: "You have already applied for this job" 
        });
      }
      
      // Get the user's latest resume if not specified
      let resumeId = applicationData.resumeId;
      if (!resumeId) {
        const resumes = await storage.getResumesByUserId(userId);
        if (resumes.length > 0) {
          resumeId = resumes[0].id;
        }
      }
      
      const application = await storage.createApplication({
        userId,
        jobId,
        coverLetter: applicationData.coverLetter,
        resumeId
      });
      
      return res.status(201).json({
        success: true,
        application
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Get user's job applications
  app.get("/api/applications", authenticateUser, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      
      const applications = await storage.getApplicationsByUserId(userId);
      
      // Enhance applications with job details
      const enhancedApplications = await Promise.all(
        applications.map(async application => {
          const job = await storage.getJob(application.jobId);
          return {
            ...application,
            job: job || { title: "Unknown Job" }
          };
        })
      );
      
      return res.json(enhancedApplications);
    } catch (error) {
      return handleError(res, error);
    }
  });

  return httpServer;
}
