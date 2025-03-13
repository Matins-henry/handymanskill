import AppTabs from "@/components/AppTabs";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function PortfolioPage() {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    duration: "",
    skills: ""
  });
  
  const { data: portfolio, isLoading, refetch } = useQuery({
    queryKey: ['/api/user/portfolio'],
  });
  
  const handleSaveProject = async () => {
    try {
      await apiRequest('POST', '/api/user/portfolio', newProject);
      setNewProject({
        title: "",
        description: "",
        duration: "",
        skills: ""
      });
      refetch();
      toast({
        title: "Project saved",
        description: "Your project has been added to your portfolio.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AppTabs activeTab="portfolio" />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Portfolio</h2>
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? "View Mode" : "Add Project"}
        </Button>
      </div>
      
      {editMode ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input 
                id="title"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                placeholder="Bathroom Renovation"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="Describe the project, challenges, and your solutions"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input 
                  id="duration"
                  value={newProject.duration}
                  onChange={(e) => setNewProject({...newProject, duration: e.target.value})}
                  placeholder="2 weeks"
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills Used (comma separated)</Label>
                <Input 
                  id="skills"
                  value={newProject.skills}
                  onChange={(e) => setNewProject({...newProject, skills: e.target.value})}
                  placeholder="Plumbing, Tiling, Electrical"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProject}>Save Project</Button>
          </CardFooter>
        </Card>
      ) : null}
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : portfolio?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolio.map((project: any) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <span className="text-sm text-gray-500">{project.duration}</span>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{project.description}</p>
                <Separator className="my-4" />
                <div className="flex flex-wrap gap-2">
                  {project.skills.split(',').map((skill: string) => (
                    <span 
                      key={skill} 
                      className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-medium">No portfolio projects yet</h3>
              <p className="text-gray-500">Add projects to showcase your skills and experience</p>
              <Button onClick={() => setEditMode(true)}>Add Your First Project</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
