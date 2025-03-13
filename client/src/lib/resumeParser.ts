// This file is for frontend handling of resume parsing functionality

import { apiRequest } from "./queryClient";

export const uploadAndParseResume = async (file: File) => {
  // Create a FormData instance to send the file
  const formData = new FormData();
  formData.append('resume', file);

  // Since apiRequest doesn't support FormData, we'll use fetch directly
  const response = await fetch('/api/user/resume/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }

  return await response.json();
};

export const getParsedSkills = async () => {
  return await apiRequest('GET', '/api/user/resume/skills');
};

export const getExtractedInfo = async () => {
  return await apiRequest('GET', '/api/user/resume/extract');
};

export const getResumeOptimizationTips = async () => {
  return await apiRequest('GET', '/api/user/resume/optimize');
};

export const downloadResume = async () => {
  const response = await fetch('/api/user/resume/download', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to download resume');
  }
  
  // Create a blob and download it
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  
  // Get filename from Content-Disposition header if available
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'resume.pdf';
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }
  
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
