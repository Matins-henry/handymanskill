import fs from "fs/promises";
import path from "path";

// Base directory for file storage
const STORAGE_DIR = path.join(process.cwd(), "uploads");

// Initialize the storage directory
const initStorage = async () => {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error("Error initializing storage directory:", error);
    throw new Error("Failed to initialize file storage");
  }
};

// Store a file and return the path
export const storeFile = async (filename: string, buffer: Buffer): Promise<string> => {
  try {
    await initStorage();
    
    const filePath = path.join(STORAGE_DIR, filename);
    await fs.writeFile(filePath, buffer);
    
    // Return a relative path rather than the full system path
    return filename;
  } catch (error) {
    console.error("Error storing file:", error);
    throw new Error("Failed to store file");
  }
};

// Get the full path for a file
export const getFilePath = async (filename: string): Promise<string> => {
  try {
    await initStorage();
    
    const filePath = path.join(STORAGE_DIR, filename);
    
    // Check if file exists
    await fs.access(filePath);
    
    return filePath;
  } catch (error) {
    console.error("Error accessing file:", error);
    throw new Error("File not found or inaccessible");
  }
};

// Read a file
export const readFile = async (filename: string): Promise<Buffer> => {
  try {
    const filePath = await getFilePath(filename);
    return fs.readFile(filePath);
  } catch (error) {
    console.error("Error reading file:", error);
    throw new Error("Failed to read file");
  }
};

// Delete a file
export const deleteFile = async (filename: string): Promise<void> => {
  try {
    const filePath = await getFilePath(filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file");
  }
};

// List all files in storage
export const listFiles = async (): Promise<string[]> => {
  try {
    await initStorage();
    return fs.readdir(STORAGE_DIR);
  } catch (error) {
    console.error("Error listing files:", error);
    throw new Error("Failed to list files");
  }
};
