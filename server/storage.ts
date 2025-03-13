import { 
  users, type User, type InsertUser, 
  resumes, type Resume, type InsertResume,
  jobs, type Job, type InsertJob,
  portfolioProjects, type PortfolioProject, type InsertPortfolioProject,
  applications, type Application, type InsertApplication
} from "@shared/schema";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Resume operations
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUserId(userId: number): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<Resume>): Promise<Resume | undefined>;
  
  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getJobs(filters?: {
    skills?: string[];
    location?: string;
    radius?: string;
    limit?: number;
    offset?: number;
  }): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;
  
  // Portfolio operations
  getPortfolioProject(id: number): Promise<PortfolioProject | undefined>;
  getPortfolioProjectsByUserId(userId: number): Promise<PortfolioProject[]>;
  createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject>;
  updatePortfolioProject(id: number, project: Partial<PortfolioProject>): Promise<PortfolioProject | undefined>;
  deletePortfolioProject(id: number): Promise<boolean>;
  
  // Application operations
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByUserId(userId: number): Promise<Application[]>;
  getApplicationsByJobId(jobId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<Application>): Promise<Application | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private jobs: Map<number, Job>;
  private portfolioProjects: Map<number, PortfolioProject>;
  private applications: Map<number, Application>;
  
  private userId: number;
  private resumeId: number;
  private jobId: number;
  private projectId: number;
  private applicationId: number;
  
  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.jobs = new Map();
    this.portfolioProjects = new Map();
    this.applications = new Map();
    
    this.userId = 1;
    this.resumeId = 1;
    this.jobId = 1;
    this.projectId = 1;
    this.applicationId = 1;
    
    // Initialize with some sample jobs
    this.seedJobs();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, skills: [] };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Resume operations
  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }
  
  async getResumesByUserId(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(
      (resume) => resume.userId === userId
    );
  }
  
  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.resumeId++;
    const resume: Resume = { 
      ...insertResume, 
      id,
      skillsExtracted: [],
      experienceYears: 0,
      matchRate: 0,
      uploadedAt: new Date()
    };
    this.resumes.set(id, resume);
    return resume;
  }
  
  async updateResume(id: number, resumeData: Partial<Resume>): Promise<Resume | undefined> {
    const resume = await this.getResume(id);
    if (!resume) return undefined;
    
    const updatedResume = { ...resume, ...resumeData };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }
  
  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }
  
  async getJobs(filters?: {
    skills?: string[];
    location?: string;
    radius?: string;
    limit?: number;
    offset?: number;
  }): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    // Apply filters if provided
    if (filters) {
      if (filters.skills && filters.skills.length > 0) {
        jobs = jobs.filter(job => 
          filters.skills!.some(skill => 
            job.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
          )
        );
      }
      
      if (filters.location) {
        jobs = jobs.filter(job => 
          job.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      
      // Simple pagination
      if (filters.limit && filters.offset !== undefined) {
        jobs = jobs.slice(filters.offset, filters.offset + filters.limit);
      } else if (filters.limit) {
        jobs = jobs.slice(0, filters.limit);
      }
    }
    
    return jobs;
  }
  
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.jobId++;
    const job: Job = { 
      ...insertJob, 
      id,
      postedAt: new Date(),
      isActive: true
    };
    this.jobs.set(id, job);
    return job;
  }
  
  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const job = await this.getJob(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...jobData };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }
  
  // Portfolio operations
  async getPortfolioProject(id: number): Promise<PortfolioProject | undefined> {
    return this.portfolioProjects.get(id);
  }
  
  async getPortfolioProjectsByUserId(userId: number): Promise<PortfolioProject[]> {
    return Array.from(this.portfolioProjects.values()).filter(
      (project) => project.userId === userId
    );
  }
  
  async createPortfolioProject(insertProject: InsertPortfolioProject): Promise<PortfolioProject> {
    const id = this.projectId++;
    const project: PortfolioProject = { 
      ...insertProject, 
      id,
      createdAt: new Date()
    };
    this.portfolioProjects.set(id, project);
    return project;
  }
  
  async updatePortfolioProject(id: number, projectData: Partial<PortfolioProject>): Promise<PortfolioProject | undefined> {
    const project = await this.getPortfolioProject(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectData };
    this.portfolioProjects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deletePortfolioProject(id: number): Promise<boolean> {
    return this.portfolioProjects.delete(id);
  }
  
  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }
  
  async getApplicationsByUserId(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.userId === userId
    );
  }
  
  async getApplicationsByJobId(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.jobId === jobId
    );
  }
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.applicationId++;
    const application: Application = { 
      ...insertApplication, 
      id,
      status: "pending",
      appliedAt: new Date()
    };
    this.applications.set(id, application);
    return application;
  }
  
  async updateApplication(id: number, applicationData: Partial<Application>): Promise<Application | undefined> {
    const application = await this.getApplication(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...applicationData };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Seed some initial jobs for testing
  private seedJobs() {
    const jobs: Omit<Job, "id">[] = [
      {
        title: "Residential Carpenter",
        company: "Johnson Construction LLC",
        location: "San Diego, CA",
        description: "Looking for experienced carpenter for residential projects including framing, finishing, and installation work. Must have own tools and reliable transportation.",
        skills: ["Carpentry", "Framing", "Woodworking", "Finishing"],
        categories: ["Residential"],
        employmentType: "Full-time",
        salary: "$30 - $35 /hour",
        contactEmail: "jobs@johnsonconstruction.example",
        contactPhone: "555-123-4567",
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        responsibilities: [
          "Frame and finish residential structures",
          "Install doors, windows, and trim",
          "Read and interpret blueprints",
          "Ensure work meets building codes and standards"
        ],
        requirements: [
          "3+ years of carpentry experience",
          "Own basic tools",
          "Valid driver's license",
          "Ability to lift 50+ pounds"
        ],
        benefits: [
          "Health insurance",
          "Paid time off",
          "401(k) matching",
          "Tool allowance"
        ],
        coordinates: { lat: 32.7157, lng: -117.1611 },
        isActive: true
      },
      {
        title: "Remodeling Specialist",
        company: "Elite Home Services",
        location: "La Jolla, CA",
        description: "Seeking experienced remodeling professional for high-end residential projects. Experience with kitchen and bathroom renovations required.",
        skills: ["Drywall", "Painting", "Flooring", "Tiling", "Renovation"],
        categories: ["Residential", "Luxury"],
        employmentType: "Contract",
        salary: "$40 - $45 /hour",
        contactEmail: "careers@elitehome.example",
        contactPhone: "555-987-6543",
        postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        responsibilities: [
          "Complete full bathroom and kitchen remodels",
          "Install custom cabinetry and fixtures",
          "Coordinate with other trades",
          "Provide estimates and timelines for clients"
        ],
        requirements: [
          "5+ years of remodeling experience",
          "Portfolio of completed projects",
          "Experience with high-end finishes",
          "Excellent communication skills"
        ],
        benefits: [
          "Flexible schedule",
          "Performance bonuses",
          "Long-term projects"
        ],
        coordinates: { lat: 32.8328, lng: -117.2713 },
        isActive: true
      },
      {
        title: "Plumbing Technician",
        company: "Fast Flow Plumbing",
        location: "San Diego, CA",
        description: "Fast Flow Plumbing needs experienced plumbing technicians for new construction and service work. Competitive pay and benefits.",
        skills: ["Plumbing", "Pipe Fitting", "Troubleshooting", "Repairs"],
        categories: ["Commercial", "Residential"],
        employmentType: "Full-time",
        salary: "$28 - $32 /hour",
        contactEmail: "hr@fastflow.example",
        contactPhone: "555-789-0123",
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        responsibilities: [
          "Install piping systems in new construction",
          "Diagnose and repair plumbing issues",
          "Respond to emergency service calls",
          "Maintain accurate service records"
        ],
        requirements: [
          "2+ years of plumbing experience",
          "Knowledge of local plumbing codes",
          "Valid driver's license",
          "Available for on-call rotation"
        ],
        benefits: [
          "Company vehicle",
          "Health and dental insurance",
          "Paid training and certification",
          "Overtime opportunities"
        ],
        coordinates: { lat: 32.7157, lng: -117.1611 },
        isActive: true
      }
    ];
    
    jobs.forEach((job) => {
      const id = this.jobId++;
      this.jobs.set(id, { ...job, id });
    });
  }
}

// Export a singleton instance of the storage
export const storage = new MemStorage();
