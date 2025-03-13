import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText } from "lucide-react";
import { uploadResume, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/resumeParser";

const formSchema = z.object({
  location: z.string().min(2, { message: "Please enter a valid location" }),
  jobRadius: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface ResumeUploadProps {
  onUploadSuccess: (fileId: string, location: string, radius: string) => void;
}

const ResumeUpload = ({ onUploadSuccess }: ResumeUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      jobRadius: "10 miles",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadResume(file),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Resume uploaded successfully",
          description: "Your resume is being processed.",
        });
        onUploadSuccess(
          data.fileId, 
          form.getValues("location"), 
          form.getValues("jobRadius")
        );
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "There was an error uploading your resume.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file.",
        });
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "File size must be less than 10MB.",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file.",
        });
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "File size must be less than 10MB.",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please upload your resume.",
      });
      return;
    }
    
    uploadMutation.mutate(selectedFile);
  };

  return (
    <section id="upload-resume" className="py-12 bg-white animate-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Resume Upload</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Let your skills do the talking
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Upload your resume and let our AI match you with jobs that fit your skillset
          </p>
        </div>

        <div className="mt-10">
          <Card className="max-w-xl mx-auto bg-gray-50 shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="resume-upload" className="block text-sm font-medium text-gray-700">
                      Upload Resume (PDF, DOCX)
                    </Label>
                    <div 
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                        isDragging ? "border-primary" : "border-gray-300"
                      } border-dashed rounded-md cursor-pointer`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="space-y-1 text-center">
                        {selectedFile ? (
                          <>
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="text-sm text-gray-600">{selectedFile.name}</p>
                          </>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600 justify-center">
                              <Label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="file-upload"
                                  ref={fileInputRef}
                                  type="file"
                                  className="sr-only"
                                  accept=".pdf,.docx"
                                  onChange={handleFileChange}
                                />
                              </Label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                          </>
                        )}
                        <p className="text-xs text-gray-500">
                          PDF or DOCX up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Location</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="City, State or Zip Code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Search Radius</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a radius" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5 miles">5 miles</SelectItem>
                            <SelectItem value="10 miles">10 miles</SelectItem>
                            <SelectItem value="25 miles">25 miles</SelectItem>
                            <SelectItem value="50 miles">50 miles</SelectItem>
                            <SelectItem value="100 miles">100 miles</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-end">
                    <Button 
                      type="submit" 
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload & Find Matches"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ResumeUpload;
