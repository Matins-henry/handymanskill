import fs from "fs/promises";
import path from "path";
import { mockParsePdf, mockParseDocx } from "./mockParsers";

// Function to parse PDF files
const parsePdfFile = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await mockParsePdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
};

// Function to parse DOCX files
const parseDocx = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const result = await mockParseDocx(dataBuffer);
    return result.value;
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error("Failed to parse DOCX file");
  }
};

// Main function to parse resume based on file type
export const parseResume = async (filePath: string, fileType: string): Promise<string> => {
  if (fileType === "application/pdf") {
    return parsePdfFile(filePath);
  } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return parseDocx(filePath);
  } else {
    throw new Error("Unsupported file type");
  }
};

// Common handyman/construction skills to look for in resumes
const HANDYMAN_SKILLS = [
  "carpentry", "woodworking", "framing", "cabinetry", "flooring",
  "plumbing", "pipe fitting", "drainage", "faucet", "toilet", 
  "electrical", "wiring", "lighting", "outlets", "circuits",
  "drywall", "plastering", "mudding", "taping", "texturing",
  "painting", "staining", "finishing", "varnishing", "wallpaper",
  "tiling", "ceramic", "porcelain", "grout", "backsplash",
  "roofing", "shingles", "gutters", "siding", "fascia",
  "landscaping", "irrigation", "fencing", "decking", "paving",
  "hvac", "furnace", "air conditioning", "ventilation", "ductwork",
  "masonry", "concrete", "brick", "stone", "mortar",
  "insulation", "weatherproofing", "sealing", "caulking", "foam",
  "renovation", "remodeling", "restoration", "construction", "repair",
  "tools", "power tools", "hand tools", "measurement", "level",
  "blueprint", "schematics", "plans", "design", "layout",
  "demolition", "removal", "disposal", "cleanup", "waste management",
  "safety", "osha", "ppe", "harness", "protocols",
  "customer service", "communication", "estimates", "quotes", "billing",
  "project management", "scheduling", "budgeting", "sourcing", "ordering"
];

// Function to extract skills and experience from parsed text
export const extractSkills = (resumeText: string): { skills: string[], years: number } => {
  const text = resumeText.toLowerCase();
  const foundSkills = new Set<string>();
  let experienceYears = 0;
  
  // Extract skills
  HANDYMAN_SKILLS.forEach(skill => {
    if (text.includes(skill.toLowerCase())) {
      // Convert first letter to uppercase
      foundSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  // Try to extract years of experience
  const experienceRegex = /(\d+)[\s+]*(year|yr|years|yrs)[\s+]*(of)?[\s+]*(experience)/i;
  const expMatch = text.match(experienceRegex);
  
  if (expMatch && expMatch[1]) {
    experienceYears = parseInt(expMatch[1], 10);
  }
  
  // Convert Set to Array for the result
  return {
    skills: Array.from(foundSkills),
    years: experienceYears
  };
};
