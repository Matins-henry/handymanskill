import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import ResumeUpload from "@/components/ResumeUpload";
import SkillsMatch from "@/components/SkillsMatch";
import JobSearch from "@/components/JobSearch";
import Portfolio from "@/components/Portfolio";
import { useQuery } from "@tanstack/react-query";
import { getResumeSkillMatches } from "@/lib/resumeParser";
import { initHomeAnimations } from "@/lib/animation";

const Home = () => {
  const [resumeProcessed, setResumeProcessed] = useState(false);
  const [resumeFileId, setResumeFileId] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");
  const [radius, setRadius] = useState<string>("");
  
  // Check if user has previously uploaded resume
  const { data: userProfile } = useQuery({
    queryKey: ['/api/user/profile'],
    retry: false,
  });
  
  useEffect(() => {
    // Initialize animations
    const cleanup = initHomeAnimations();
    
    // If user has a resume already, show skills match
    if (userProfile?.resumeId) {
      setResumeFileId(userProfile.resumeId);
      setResumeProcessed(true);
      setLocation(userProfile.location || "");
      setRadius(userProfile.jobRadius || "10 miles");
    }
    
    return cleanup;
  }, [userProfile]);
  
  // Get skills data if resume is processed
  const { data: skillsData } = useQuery({
    queryKey: ['/api/resume/skills', resumeFileId],
    enabled: !!resumeFileId && resumeProcessed,
  });
  
  const { data: portfolioProjects } = useQuery({
    queryKey: ['/api/portfolio/projects'],
  });
  
  const handleUploadSuccess = (fileId: string, userLocation: string, searchRadius: string) => {
    setResumeFileId(fileId);
    setLocation(userLocation);
    setRadius(searchRadius);
    setResumeProcessed(true);
  };
  
  // Default skills data for when API data isn't available
  const defaultSkillsData = {
    primary: ["Carpentry", "Plumbing", "Electrical", "Drywall Installation", "Painting"],
    secondary: ["Project Management", "Customer Service", "Cost Estimation", "Time Management"],
    experienceYears: 7,
    experienceLevel: 85,
    suggestions: [
      "Add more specific project examples to showcase your carpentry skills",
      "Include certifications or training in electrical work",
      "Quantify your achievements (e.g., completed projects on time/under budget)"
    ],
    matchRate: 95
  };

  return (
    <div>
      <Hero />
      <ResumeUpload onUploadSuccess={handleUploadSuccess} />
      
      {/* Only show skills match and job search if resume is processed */}
      {resumeProcessed && (
        <>
          <SkillsMatch skills={skillsData || defaultSkillsData} />
          <JobSearch 
            initialSkills={skillsData?.primary || defaultSkillsData.primary} 
            initialLocation={location}
            initialRadius={radius}
          />
        </>
      )}
      
      <Portfolio userProjects={portfolioProjects} />
    </div>
  );
};

export default Home;
