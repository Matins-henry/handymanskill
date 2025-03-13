import AppTabs from "@/components/AppTabs";
import JobMatchesSection from "@/components/JobMatchesSection";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function JobMatchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [distanceFilter, setDistanceFilter] = useState([25]); // miles
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const { data: filters } = useQuery({
    queryKey: ['/api/filters'],
  });
  
  const { data: skills } = useQuery({
    queryKey: ['/api/skills'],
  });
  
  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setDistanceFilter([25]);
    setSelectedSkills([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AppTabs activeTab="job-matches" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input 
                  id="search"
                  placeholder="Job title or keyword" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <div className="flex justify-between">
                  <Label>Distance</Label>
                  <span className="text-sm text-gray-500">{distanceFilter[0]} miles</span>
                </div>
                <Slider
                  value={distanceFilter}
                  onValueChange={setDistanceFilter}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="block mb-2">Skills</Label>
                {skills?.map((skill: string) => (
                  <div key={skill} className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                      id={`skill-${skill}`}
                      checked={selectedSkills.includes(skill)}
                      onCheckedChange={() => handleSkillToggle(skill)}
                    />
                    <Label 
                      htmlFor={`skill-${skill}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Job Matches</h2>
            <div className="flex gap-2">
              {selectedSkills.map(skill => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button 
                    onClick={() => handleSkillToggle(skill)}
                    className="ml-1 text-xs hover:text-gray-900"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {selectedSkills.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
          
          <JobMatchesSection 
            searchTerm={searchTerm}
            distance={distanceFilter[0]}
            skills={selectedSkills}
            showViewAll={false}
          />
        </div>
      </div>
    </div>
  );
}
