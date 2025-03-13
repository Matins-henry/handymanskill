import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as pdfParse from "pdf-parse";
import { Readable } from "stream";
import * as docx from "docx-parser";
import { promisify } from "util";
import { User, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

// Sample user for demo purposes
let currentUser: User = {
  id: 1,
  username: "mjohnson",
  password: "password123", // In a real app, this would be hashed
  name: "Michael Johnson",
  title: "Experienced Handyman",
  about: "Skilled handyman with over 10 years of experience in residential and commercial repairs and renovations. Proficient in plumbing, electrical work, carpentry, and general maintenance.",
  location: "San Francisco, CA",
  profileImage: undefined,
  createdAt: new Date()
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - user profile
  app.get('/api/user/profile', async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(currentUser.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  });
  
  app.patch('/api/user/profile', async (req: Request, res: Response) => {
    try {
      const { name, title, about } = req.body;
      
      const user = await storage.updateUser(currentUser.id, { 
        name, title, about 
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update current user
      currentUser = user;
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Failed to update user profile' });
    }
  });
  
  // Resume routes
  app.get('/api/user/resume', async (req: Request, res: Response) => {
    try {
      const resume = await storage.getResumeByUserId(currentUser.id);
      
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      // Format the response
      const response = {
        id: resume.id,
        filename: resume.filename,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
        uploadDate: resume.uploadDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        extractedSkills: resume.extractedSkills,
        lastUpdated: `${Math.floor((Date.now() - resume.uploadDate.getTime()) / (24 * 60 * 60 * 1000))} days ago`
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching resume:', error);
      res.status(500).json({ message: 'Failed to fetch resume' });
    }
  });
  
  app.post('/api/user/resume/upload', upload.single('resume'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Get file details
      const { originalname, mimetype, size, buffer } = req.file;
      
      // Parse the resume based on file type
      let extractedText = '';
      let extractedSkills: string[] = [];
      
      if (mimetype === 'application/pdf') {
        // Parse PDF
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Parse DOCX
        // Using a simpler approach for demo
        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);
        
        // Mock docx parsing (in a real app, use actual docx parsing)
        extractedText = "Sample extracted text from DOCX";
      }
      
      // Extract skills (simple keyword matching for demo)
      const skillKeywords = [
        "Plumbing", "Electrical", "Carpentry", "Painting", "Drywall",
        "Tiling", "Flooring", "Roofing", "HVAC", "Appliance",
        "Welding", "Masonry", "Landscaping", "Concrete", "Cabinetry"
      ];
      
      extractedSkills = skillKeywords.filter(skill => 
        extractedText.toLowerCase().includes(skill.toLowerCase())
      );
      
      // Delete existing resume if any
      const existingResume = await storage.getResumeByUserId(currentUser.id);
      if (existingResume) {
        await storage.deleteResume(existingResume.id);
      }
      
      // Save the resume
      const resume = await storage.createResume({
        userId: currentUser.id,
        filename: originalname,
        fileSize: `${(size / 1024 / 1024).toFixed(1)} MB`,
        fileType: mimetype,
        content: extractedText,
        extractedSkills
      });
      
      // Generate optimization suggestions based on skills
      if (extractedSkills.length < 3) {
        await storage.createSuggestion({
          userId: currentUser.id,
          title: "Add more skills to your resume",
          description: "Having at least 5 skills increases your match rate by 30%",
          type: "warning",
          implemented: false
        });
      }
      
      if (!extractedText.includes("certification") && !extractedText.includes("certified")) {
        await storage.createSuggestion({
          userId: currentUser.id,
          title: "Add certifications to your resume",
          description: "Mentioning certifications can increase employer confidence",
          type: "warning",
          implemented: false
        });
      }
      
      res.status(201).json({
        message: 'Resume uploaded successfully',
        filename: originalname,
        extractedSkills
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      res.status(500).json({ message: 'Failed to upload resume' });
    }
  });
  
  app.delete('/api/user/resume', async (req: Request, res: Response) => {
    try {
      const resume = await storage.getResumeByUserId(currentUser.id);
      
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      await storage.deleteResume(resume.id);
      res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
      console.error('Error deleting resume:', error);
      res.status(500).json({ message: 'Failed to delete resume' });
    }
  });
  
  // Resume suggestions
  app.get('/api/user/resume/suggestions', async (req: Request, res: Response) => {
    try {
      const suggestions = await storage.getSuggestionsByUserId(currentUser.id);
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ message: 'Failed to fetch suggestions' });
    }
  });
  
  // Job routes
  app.get('/api/jobs/matches', async (req: Request, res: Response) => {
    try {
      // Parse filter parameters
      const searchTerm = req.query.searchTerm as string | undefined;
      const distance = req.query.distance ? parseInt(req.query.distance as string) : undefined;
      const skills = req.query.skills ? (req.query.skills as string).split(',') : undefined;
      
      const matches = await storage.getJobMatches(currentUser.id, {
        searchTerm,
        distance,
        skills
      });
      
      res.json(matches);
    } catch (error) {
      console.error('Error fetching job matches:', error);
      res.status(500).json({ message: 'Failed to fetch job matches' });
    }
  });
  
  app.post('/api/jobs/:id/save', async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      await storage.saveJob({
        userId: currentUser.id,
        jobId,
        savedDate: new Date()
      });
      
      res.json({ message: 'Job saved successfully' });
    } catch (error) {
      console.error('Error saving job:', error);
      res.status(500).json({ message: 'Failed to save job' });
    }
  });
  
  app.post('/api/jobs/:id/apply', async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      await storage.createJobApplication({
        userId: currentUser.id,
        jobId,
        status: 'pending',
        applicationDate: new Date(),
        coverLetter: req.body.coverLetter
      });
      
      res.json({ message: 'Application submitted successfully' });
    } catch (error) {
      console.error('Error applying for job:', error);
      res.status(500).json({ message: 'Failed to submit application' });
    }
  });
  
  // Skills and filters
  app.get('/api/skills', async (req: Request, res: Response) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills.map(skill => skill.name));
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ message: 'Failed to fetch skills' });
    }
  });
  
  app.get('/api/filters', async (req: Request, res: Response) => {
    // Return available filter options
    res.json({
      jobTypes: ['Full-time', 'Part-time', 'Contract', 'Temporary'],
      salaryRanges: ['Under $25/hr', '$25-35/hr', '$35-50/hr', 'Over $50/hr'],
      experienceLevels: ['Entry Level', 'Mid Level', 'Senior Level']
    });
  });
  
  // Portfolio routes
  app.get('/api/user/portfolio', async (req: Request, res: Response) => {
    try {
      const portfolioItems = await storage.getPortfolioByUserId(currentUser.id);
      res.json(portfolioItems);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({ message: 'Failed to fetch portfolio' });
    }
  });
  
  app.post('/api/user/portfolio', async (req: Request, res: Response) => {
    try {
      const { title, description, duration, skills } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }
      
      const portfolioItem = await storage.createPortfolioItem({
        userId: currentUser.id,
        title,
        description,
        duration,
        skills,
        createdAt: new Date()
      });
      
      res.status(201).json(portfolioItem);
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      res.status(500).json({ message: 'Failed to create portfolio item' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
