import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Camera, Pencil } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  projectType: z.string(),
  description: z.string().min(10, { message: "Please provide a detailed description of your project" }),
});

type FormValues = z.infer<typeof formSchema>;

interface PortfolioProject {
  id: string;
  title: string;
  projectType: string;
  description: string;
  imageUrl: string;
  skills: string[];
}

interface PortfolioProps {
  userProjects?: PortfolioProject[];
}

const Portfolio = ({ userProjects = [] }: PortfolioProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      projectType: "Carpentry",
      description: "",
    },
  });

  const addProjectMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/portfolio/project", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add project: ${errorText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project added",
        description: "Your portfolio project has been added successfully.",
      });
      form.reset();
      setSelectedImages([]);
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/projects'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to add project",
        description: error.message,
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setSelectedImages(fileArray);
    }
  };

  const onSubmit = (values: FormValues) => {
    if (selectedImages.length === 0) {
      toast({
        variant: "destructive",
        title: "No images selected",
        description: "Please upload at least one image of your project.",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("projectType", values.projectType);
    formData.append("description", values.description);
    
    selectedImages.forEach((file, index) => {
      formData.append(`image-${index}`, file);
    });
    
    addProjectMutation.mutate(formData);
  };

  return (
    <section id="portfolio" className="py-12 bg-gray-50 animate-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Portfolio</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Showcase your work
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Add your best projects to increase your chances of getting hired
          </p>
        </div>

        <div className="mt-10 max-w-xl mx-auto">
          <Card>
            <CardContent className="pt-6 px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Upload portfolio projects</h3>
              <p className="mt-2 max-w-xl text-sm text-gray-500 mb-6">
                Add photos of your completed projects to showcase your skills.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Kitchen Renovation" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Carpentry">Carpentry</SelectItem>
                              <SelectItem value="Plumbing">Plumbing</SelectItem>
                              <SelectItem value="Electrical">Electrical</SelectItem>
                              <SelectItem value="Painting">Painting</SelectItem>
                              <SelectItem value="Renovation">Renovation</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                rows={3} 
                                placeholder="Describe what you did, materials used, challenges overcome, etc."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <FormLabel>Project Photos</FormLabel>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <Camera className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label
                              htmlFor="photo-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                            >
                              <span>Upload photos</span>
                              <input
                                id="photo-upload"
                                name="photo-upload"
                                type="file"
                                className="sr-only"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          {selectedImages.length > 0 ? (
                            <p className="text-xs text-gray-500">
                              {selectedImages.length} file(s) selected
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 text-right">
                    <Button 
                      type="submit" 
                      disabled={addProjectMutation.isPending}
                    >
                      {addProjectMutation.isPending ? "Adding..." : "Add Project"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Gallery */}
        <div className="mt-12 max-w-7xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Portfolio</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img 
                    className="h-48 w-full object-cover" 
                    src={project.imageUrl} 
                    alt={project.title} 
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">{project.skills.join(', ')}</p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="outline">
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {userProjects.length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No portfolio projects yet</p>
                <p className="text-sm text-gray-400 mt-2">Add your first project to showcase your skills</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
