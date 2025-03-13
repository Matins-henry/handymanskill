// Abstraction over pdf and docx parsing functionality
// The actual parsing happens on the server, this module provides client-side helpers

import { apiRequest } from "./queryClient";

type ResumeParseResponse = {
  skills: string[];
  experience: {
    years: number;
    positions: string[];
  };
  education: string[];
  success: boolean;
  message?: string;
};

export type FileUploadResponse = {
  fileId: string;
  fileName: string;
  fileType: string;
  success: boolean;
};

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadResume(file: File): Promise<FileUploadResponse> {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error("Unsupported file format. Please upload a PDF or DOCX file.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 10MB limit.");
  }

  const formData = new FormData();
  formData.append("resume", file);
  
  const response = await fetch("/api/resume/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${errorText}`);
  }
  
  return await response.json();
}

export async function parseResume(fileId: string): Promise<ResumeParseResponse> {
  const response = await apiRequest("GET", `/api/resume/parse/${fileId}`, undefined);
  return await response.json();
}

export async function getResumeSkillMatches(fileId: string) {
  const response = await apiRequest("GET", `/api/resume/skills/${fileId}`, undefined);
  return await response.json();
}
