import { useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createSkillsVisualization } from "@/lib/threeScene";
import { animate } from "@/lib/animation";

interface SkillsMatchProps {
  skills: {
    primary: string[];
    secondary: string[];
    experienceYears: number;
    experienceLevel: number;
    suggestions: string[];
    matchRate: number;
  };
}

const SkillsMatch = ({ skills }: SkillsMatchProps) => {
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (threeContainerRef.current) {
      const scene = createSkillsVisualization("three-container");
      
      return () => {
        scene.dispose(); // Clean up Three.js scene when component unmounts
      };
    }
  }, []);
  
  useEffect(() => {
    if (progressRef.current) {
      animate({
        target: progressRef.current,
        properties: { width: `${skills.experienceLevel}%` },
        duration: 1,
        delay: 0.5,
      });
    }
  }, [skills.experienceLevel]);

  return (
    <section className="py-12 bg-gray-50 animate-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Skills Match</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Your Skills Summary
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Based on your resume, we've identified these key skills
          </p>
        </div>

        <div className="mt-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div 
            ref={threeContainerRef} 
            id="three-container" 
            className="h-64 lg:h-auto bg-white shadow-sm rounded-lg overflow-hidden"
          ></div>
          
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Skills Analysis</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Extracted from your resume</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-0">
                  {skills.matchRate}% Match Rate
                </Badge>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Primary Skills</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {skills.primary.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-primary bg-opacity-10 text-primary border-0">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <h4 className="text-md font-medium text-gray-900 mb-3">Secondary Skills</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {skills.secondary.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800 border-0">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <h4 className="text-md font-medium text-gray-900 mb-3">Experience Level</h4>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div 
                    ref={progressRef}
                    className="bg-green-500 h-2.5 rounded-full w-0"
                  ></div>
                </div>
                <p className="text-sm text-gray-500">{skills.experienceYears}+ years of relevant experience</p>
              </div>

              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Suggestions to Improve Your Resume</h4>
                <ul className="mt-3 list-disc list-inside text-sm text-gray-500">
                  {skills.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsMatch;
