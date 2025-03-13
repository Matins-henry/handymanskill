import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { queryClient } from "@/lib/queryClient";
import { CheckCircle2, FileText, Upload, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResumeUploadSectionProps {
  resumeInfo: any;
}

export default function ResumeUploadSection({ resumeInfo }: ResumeUploadSectionProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create a simulated upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      const formData = new FormData();
      formData.append('resume', file);
      
      // Manual fetch to handle FormData
      const response = await fetch('/api/user/resume/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        queryClient.invalidateQueries({ queryKey: ['/api/user/resume'] });
        
        toast({
          title: "Resume uploaded",
          description: "Your resume has been uploaded and analyzed successfully."
        });
      }, 500);
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveResume = async () => {
    try {
      await apiRequest('DELETE', '/api/user/resume');
      queryClient.invalidateQueries({ queryKey: ['/api/user/resume'] });
      toast({
        title: "Resume removed",
        description: "Your resume has been removed successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove resume. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <section className="mb-10">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Resume</h3>
            {resumeInfo?.lastUpdated && (
              <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                Last updated: {resumeInfo.lastUpdated}
              </span>
            )}
          </div>

          {resumeInfo ? (
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <i className="ri-file-pdf-line text-2xl text-red-500 mr-3"></i>
                  <div>
                    <h4 className="font-medium">{resumeInfo.filename}</h4>
                    <p className="text-sm text-gray-500">{resumeInfo.fileSize} • Uploaded on {resumeInfo.uploadDate}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark flex items-center text-sm">
                    <i className="ri-download-line mr-1"></i> Download
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                    onClick={handleRemoveResume}
                  >
                    <i className="ri-delete-bin-line mr-1"></i> Remove
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h5 className="font-medium mb-2">Extracted Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {resumeInfo.extractedSkills?.map((skill: string) => (
                    <div key={skill} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-800 flex items-center">
                      {skill}
                      <div className="ml-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center text-white text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {isUploading ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="max-w-xl mx-auto">
                <h4 className="text-lg font-medium mb-4">Uploading resume...</h4>
                <Progress value={uploadProgress} className="mb-2" />
                <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="max-w-xl mx-auto">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <h4 className="text-lg font-medium mb-1">Upload a {resumeInfo ? 'new ' : ''}resume</h4>
                <p className="text-sm text-gray-500 mb-4">Drag and drop your resume file (PDF, DOCX) or click to browse</p>
                <div className="flex justify-center">
                  <Button onClick={triggerFileInput} className="bg-primary hover:bg-primary-dark text-white">
                    <FileText className="mr-2 h-4 w-4" /> Upload Resume
                    <input 
                      ref={fileInputRef}
                      id="resume-upload" 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.docx" 
                      onChange={handleFileUpload}
                    />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-4">Max file size: 5MB. Supported formats: PDF, DOCX</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
