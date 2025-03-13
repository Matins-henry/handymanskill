import { Button } from "@/components/ui/button";
import { Bookmark, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface JobCardProps {
  job: any;
}

export default function JobCard({ job }: JobCardProps) {
  const [isSaving, setSaving] = useState(false);
  const [isApplying, setApplying] = useState(false);
  const { toast } = useToast();
  
  const handleSaveJob = async () => {
    try {
      setSaving(true);
      await apiRequest('POST', `/api/jobs/${job.id}/save`, {});
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/matches'] });
      toast({
        title: "Job saved",
        description: "The job has been saved to your bookmarks."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleApplyJob = async () => {
    try {
      setApplying(true);
      await apiRequest('POST', `/api/jobs/${job.id}/apply`, {});
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/matches'] });
      toast({
        title: "Application submitted",
        description: "Your job application has been submitted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };
  
  const getSkillClass = (match: string) => {
    switch (match) {
      case 'strong':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 hover:border-primary transition-colors duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{job.title}</h3>
            <p className="text-gray-600 text-sm">{job.company}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="bg-secondary text-white text-xs font-bold rounded-full w-12 h-12 flex items-center justify-center">
              {job.matchPercentage}%
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="mr-1 h-4 w-4" /> {job.location} ({job.distance} miles)
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-1 h-4 w-4" /> {job.type} • {job.salary}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Skills Match</h4>
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 3).map((skill: any) => (
              <span 
                key={skill.name} 
                className={`${getSkillClass(skill.match)} text-xs px-2 py-1 rounded`}
              >
                {skill.name}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                +{job.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            className="flex-1"
            onClick={handleApplyJob}
            disabled={isApplying}
          >
            {isApplying ? "Applying..." : "Apply Now"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSaveJob}
            disabled={isSaving}
            className={`w-10 h-10 ${job.saved ? 'text-primary border-primary' : 'text-gray-400 hover:border-primary hover:text-primary'}`}
          >
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
