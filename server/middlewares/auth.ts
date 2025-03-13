import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import bcrypt from "bcrypt";

// Hash a password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Compare a password with a hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Middleware to authenticate a user from session
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get userId from session
    const userId = (req as any).session?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }
    
    // Verify the user exists
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid user session" 
      });
    }
    
    // Attach user ID to the request
    (req as any).userId = userId;
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Authentication error" 
    });
  }
};

// Middleware to require specific authentication but continue if not authenticated
export const requireAuth = (requiredAuth: boolean) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get userId from session
    const userId = (req as any).session?.userId;
    
    if (userId) {
      // Verify the user exists
      const user = await storage.getUser(userId);
      
      if (user) {
        // Attach user ID to the request
        (req as any).userId = userId;
      }
    }
    
    // If authentication is required but user is not authenticated, return 401
    if (requiredAuth && !(req as any).userId) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }
    
    next();
  };
};
