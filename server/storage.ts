import { 
  User, InsertUser, Resume, InsertResume, Job, Portfolio, InsertPortfolio, 
  JobApplication, InsertJobApplication, SavedJob, InsertSavedJob,
  OptimizationSuggestion, InsertOptimizationSuggestion, Skill
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Resume operations
  getResume(id: number): Promise<Resume | undefined>;
  getResumeByUserId(userId: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resumeData: Partial<Resume>): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;
  
  // Skill operations
  getAllSkills(): Promise<Skill[]>;
  
  // Job operations
  getAllJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  getJobMatches(userId: number, filters?: {
    searchTerm?: string;
    distance?: number;
    skills?: string[];
  }): Promise<any[]>; // Using 'any' for the complex match object
  
  // Job application operations
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplicationsByUserId(userId: number): Promise<JobApplication[]>;
  
  // Saved job operations
  saveJob(savedJob: InsertSavedJob): Promise<SavedJob>;
  unsaveJob(userId: number, jobId: number): Promise<boolean>;
  getSavedJobsByUserId(userId: number): Promise<SavedJob[]>;
  
  // Portfolio operations
  createPortfolioItem(item: InsertPortfolio): Promise<Portfolio>;
  getPortfolioByUserId(userId: number): Promise<Portfolio[]>;
  
  // Optimization suggestions
  getSuggestionsByUserId(userId: number): Promise<OptimizationSuggestion[]>;
  createSuggestion(suggestion: InsertOptimizationSuggestion): Promise<OptimizationSuggestion>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private skills: Map<number, Skill>;
  private jobs: Map<number, Job>;
  private jobApplications: Map<number, JobApplication>;
  private savedJobs: Map<number, SavedJob>;
  private portfolioItems: Map<number, Portfolio>;
  private suggestions: Map<number, OptimizationSuggestion>;
  
  private userId: number;
  private resumeId: number;
  private skillId: number;
  private jobId: number;
  private applicationId: number;
  private savedJobId: number;
  private portfolioId: number;
  private suggestionId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.skills = new Map();
    this.jobs = new Map();
    this.jobApplications = new Map();
    this.savedJobs = new Map();
    this.portfolioItems = new Map();
    this.suggestions = new Map();
    
    this.userId = 1;
    this.resumeId = 1;
    this.skillId = 1;
    this.jobId = 1;
    this.applicationId = 1;
    this.savedJobId = 1;
    this.portfolioId = 1;
    this.suggestionId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Resume operations
  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }
  
  async getResumeByUserId(userId: number): Promise<Resume | undefined> {
    return Array.from(this.resumes.values()).find(
      (resume) => resume.userId === userId
    );
  }
  
  async createResume(resume: InsertResume): Promise<Resume> {
    const id = this.resumeId++;
    const newResume: Resume = { ...resume, id };
    this.resumes.set(id, newResume);
    return newResume;
  }
  
  async updateResume(id: number, resumeData: Partial<Resume>): Promise<Resume | undefined> {
    const resume = this.resumes.get(id);
    if (!resume) return undefined;
    
    const updatedResume = { ...resume, ...resumeData };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }
  
  async deleteResume(id: number): Promise<boolean> {
    return this.resumes.delete(id);
  }
  
  // Skill operations
  async getAllSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }
  
  // Job operations
  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }
  
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }
  
  async getJobMatches(userId: number, filters?: {
    searchTerm?: string;
    distance?: number;
    skills?: string[];
  }): Promise<any[]> {
    const user = this.users.get(userId);
    const resume = await this.getResumeByUserId(userId);
    
    if (!user || !resume) return [];
    
    let jobs = Array.from(this.jobs.values());
    
    // Apply filters if specified
    if (filters) {
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(term) || 
          job.company.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term)
        );
      }
      
      if (filters.distance) {
        // Simple distance filter based on static distances
        // In a real app, this would use actual geolocation calculations
        jobs = jobs.filter(job => {
          const distance = parseFloat(job.location.split('(')[1]?.split(' miles')[0] || '100');
          return distance <= filters.distance!;
        });
      }
      
      if (filters.skills && filters.skills.length > 0) {
        jobs = jobs.filter(job => {
          // Check if any of the job's required skills match the filter skills
          return job.requiredSkills.some((skill: string) => 
            filters.skills!.includes(skill)
          );
        });
      }
    }
    
    // Calculate match percentage based on extracted skills
    const userSkills = resume.extractedSkills || [];
    
    const jobMatches = jobs.map(job => {
      // Calculate match percentage
      const requiredSkills = job.requiredSkills;
      const matchingSkills = requiredSkills.filter(skill => 
        userSkills.includes(skill)
      );
      
      const matchPercentage = Math.round(
        (matchingSkills.length / requiredSkills.length) * 100
      );
      
      // Get saved status
      const isSaved = Array.from(this.savedJobs.values()).some(
        saved => saved.userId === userId && saved.jobId === job.id
      );
      
      // Format skills with match strength
      const formattedSkills = requiredSkills.map(skill => ({
        name: skill,
        match: userSkills.includes(skill) ? 'strong' : 
               userSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || 
                                   skill.toLowerCase().includes(s.toLowerCase())) 
               ? 'medium' : 'weak'
      }));
      
      // Get distance from location string
      const distance = job.location.split('(')[1]?.split(' miles')[0] || '0';
      
      return {
        ...job,
        matchPercentage,
        saved: isSaved,
        skills: formattedSkills,
        distance
      };
    });
    
    // Sort by match percentage (descending)
    return jobMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
  
  // Job application operations
  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const id = this.applicationId++;
    const newApplication: JobApplication = { ...application, id };
    this.jobApplications.set(id, newApplication);
    return newApplication;
  }
  
  async getJobApplicationsByUserId(userId: number): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values()).filter(
      app => app.userId === userId
    );
  }
  
  // Saved job operations
  async saveJob(savedJob: InsertSavedJob): Promise<SavedJob> {
    // Check if already saved
    const existing = Array.from(this.savedJobs.values()).find(
      job => job.userId === savedJob.userId && job.jobId === savedJob.jobId
    );
    
    if (existing) return existing;
    
    const id = this.savedJobId++;
    const newSavedJob: SavedJob = { 
      ...savedJob, 
      id, 
      savedDate: new Date() 
    };
    this.savedJobs.set(id, newSavedJob);
    return newSavedJob;
  }
  
  async unsaveJob(userId: number, jobId: number): Promise<boolean> {
    const savedJob = Array.from(this.savedJobs.values()).find(
      job => job.userId === userId && job.jobId === jobId
    );
    
    if (!savedJob) return false;
    return this.savedJobs.delete(savedJob.id);
  }
  
  async getSavedJobsByUserId(userId: number): Promise<SavedJob[]> {
    return Array.from(this.savedJobs.values()).filter(
      job => job.userId === userId
    );
  }
  
  // Portfolio operations
  async createPortfolioItem(item: InsertPortfolio): Promise<Portfolio> {
    const id = this.portfolioId++;
    const newItem: Portfolio = { ...item, id, createdAt: new Date() };
    this.portfolioItems.set(id, newItem);
    return newItem;
  }
  
  async getPortfolioByUserId(userId: number): Promise<Portfolio[]> {
    return Array.from(this.portfolioItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Optimization suggestions
  async getSuggestionsByUserId(userId: number): Promise<OptimizationSuggestion[]> {
    return Array.from(this.suggestions.values()).filter(
      suggestion => suggestion.userId === userId
    );
  }
  
  async createSuggestion(suggestion: InsertOptimizationSuggestion): Promise<OptimizationSuggestion> {
    const id = this.suggestionId++;
    const newSuggestion: OptimizationSuggestion = { ...suggestion, id };
    this.suggestions.set(id, newSuggestion);
    return newSuggestion;
  }
  
  // Initialize sample data for demo
  private initializeSampleData() {
    // Sample skills
    const skillsList = [
      "Plumbing", "Electrical", "Carpentry", "Painting", "Drywall", 
      "Tiling", "Flooring", "Roofing", "HVAC", "Appliance Repair",
      "Welding", "Masonry", "Landscaping", "Concrete Work", "Cabinetry"
    ];
    
    skillsList.forEach(name => {
      const id = this.skillId++;
      this.skills.set(id, { id, name, category: "Handyman" });
    });
    
    // Sample user
    const userId = this.userId++;
    this.users.set(userId, {
      id: userId,
      username: "mjohnson",
      password: "password123", // In a real app, this would be hashed
      name: "Michael Johnson",
      title: "Experienced Handyman",
      about: "Skilled handyman with over 10 years of experience in residential and commercial repairs and renovations. Proficient in plumbing, electrical work, carpentry, and general maintenance.",
      location: "San Francisco, CA",
      profileImage: undefined,
      createdAt: new Date()
    });
    
    // Sample resume
    const resumeId = this.resumeId++;
    this.resumes.set(resumeId, {
      id: resumeId,
      userId,
      filename: "michael_johnson_resume.pdf",
      fileSize: "2.4 MB",
      fileType: "application/pdf",
      content: "Sample resume content...",
      uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      extractedSkills: ["Plumbing", "Electrical", "Carpentry", "Painting", "Drywall Repair"]
    });
    
    // Sample jobs
    const createJob = (
      title: string, 
      company: string, 
      location: string, 
      type: string, 
      salary: string, 
      skills: string[]
    ) => {
      const id = this.jobId++;
      this.jobs.set(id, {
        id,
        title,
        company,
        location,
        description: `We are looking for an experienced ${title} to join our team...`,
        type,
        salary,
        latitude: "37.7749",  // San Francisco coordinates
        longitude: "-122.4194",
        requiredSkills: skills,
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
      });
    };
    
    createJob(
      "Residential Plumbing Specialist", 
      "HomeFixers Inc.", 
      "San Francisco, CA (3.2 miles)", 
      "Full-time", 
      "$35-45/hr", 
      ["Plumbing", "Pipe Fitting", "Fixture Installation"]
    );
    
    createJob(
      "General Maintenance Technician", 
      "City Property Management", 
      "San Francisco, CA (1.8 miles)", 
      "Full-time", 
      "$30-40/hr", 
      ["Plumbing", "Electrical", "Carpentry", "Painting", "Drywall"]
    );
    
    createJob(
      "Home Renovation Specialist", 
      "RenovateRight Contractors", 
      "Oakland, CA (5.6 miles)", 
      "Contract", 
      "$40-50/hr", 
      ["Carpentry", "Drywall", "Tile Work", "Painting", "Flooring"]
    );
    
    createJob(
      "Commercial Electrician", 
      "PowerPro Services", 
      "San Jose, CA (45.2 miles)", 
      "Full-time", 
      "$50-60/hr", 
      ["Electrical", "Wiring", "Circuit Installation", "Troubleshooting"]
    );
    
    createJob(
      "Handyman - Multiple Properties", 
      "Bay Area Property Management", 
      "San Francisco, CA (2.5 miles)", 
      "Part-time", 
      "$25-35/hr", 
      ["Plumbing", "Electrical", "Drywall", "Painting", "Basic Repairs"]
    );
    
    // Sample suggestions
    const createSuggestion = (
      title: string,
      description: string,
      type: "warning" | "success"
    ) => {
      const id = this.suggestionId++;
      this.suggestions.set(id, {
        id,
        userId,
        title,
        description,
        type,
        implemented: false
      });
    };
    
    createSuggestion(
      "Add specific certifications",
      "Mentioning industry certifications can increase your match rate by 45%",
      "warning"
    );
    
    createSuggestion(
      "Include project examples",
      "Describing 2-3 detailed project examples can improve your match quality",
      "warning"
    );
    
    createSuggestion(
      "Good skill coverage",
      "Your resume includes all key skills for your target positions",
      "success"
    );
  }
}

export const storage = new MemStorage();
