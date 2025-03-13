import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  MapPin, 
  Clock, 
  Search, 
  MapIcon 
} from "lucide-react";
import { staggerItems } from "@/lib/animation";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  distance: string;
  postedTime: string;
  skills: string[];
  categories: string[];
  employmentType: string;
  description: string;
  salary: string;
  matchPercentage: number;
}

interface JobSearchProps {
  initialSkills?: string[];
  initialLocation?: string;
  initialRadius?: string;
}

const JobSearch = ({ initialSkills, initialLocation, initialRadius }: JobSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [distance, setDistance] = useState(initialRadius ? initialRadius : "Any Distance");
  const [sortBy, setSortBy] = useState("Best Match");
  
  // Jobs query - in a real app, would include filters from state
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs', initialSkills, initialLocation, initialRadius],
  });
  
  // Reference to job cards container for animation
  const jobCardsRef = { current: null as HTMLDivElement | null };
  
  useEffect(() => {
    // Animate job cards when loaded
    if (jobs && jobCardsRef.current) {
      const cards = jobCardsRef.current.querySelectorAll('.job-card');
      if (cards.length) {
        staggerItems(cards, 0.2, 0.5, 0.1);
      }
    }
  }, [jobs]);
  
  const filteredJobs = jobs?.filter((job: Job) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
      job.description.toLowerCase().includes(searchLower)
    );
  }) || [];
  
  const sortedJobs = [...filteredJobs].sort((a: Job, b: Job) => {
    switch (sortBy) {
      case "Best Match":
        return b.matchPercentage - a.matchPercentage;
      case "Most Recent":
        return new Date(b.postedTime).getTime() - new Date(a.postedTime).getTime();
      case "Highest Paying":
        return parseFloat(b.salary.split('-')[1]) - parseFloat(a.salary.split('-')[1]);
      case "Closest":
        return parseFloat(a.distance) - parseFloat(b.distance);
      default:
        return 0;
    }
  });

  return (
    <section id="job-search" className="py-12 bg-white animate-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Job Matches</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Jobs that match your skills
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Based on your resume and location, we've found these potential matches
          </p>
        </div>

        {/* Search Controls */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </Label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  id="search-term"
                  placeholder="Keywords (e.g., carpentry, renovation)"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/4">
              <Label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
                Distance
              </Label>
              <Select value={distance} onValueChange={setDistance}>
                <SelectTrigger id="distance">
                  <SelectValue placeholder="Select distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any Distance">Any Distance</SelectItem>
                  <SelectItem value="Within 5 miles">Within 5 miles</SelectItem>
                  <SelectItem value="Within 10 miles">Within 10 miles</SelectItem>
                  <SelectItem value="Within 25 miles">Within 25 miles</SelectItem>
                  <SelectItem value="Within 50 miles">Within 50 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/4">
              <Label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Best Match">Best Match</SelectItem>
                  <SelectItem value="Most Recent">Most Recent</SelectItem>
                  <SelectItem value="Highest Paying">Highest Paying</SelectItem>
                  <SelectItem value="Closest">Closest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Map and Job Listings */}
        <div className="mt-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-1 bg-gray-100 rounded-lg overflow-hidden shadow-sm h-96">
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Interactive map showing job locations
                </p>
                <p className="text-xs text-gray-400 mt-2">Powered by Google Maps</p>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-2">
            <div 
              ref={(el) => { jobCardsRef.current = el; }}
              className="space-y-4"
            >
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="spinner"></div>
                  <p className="mt-4 text-gray-500">Loading job listings...</p>
                </div>
              ) : sortedJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-gray-500">No jobs found matching your criteria</p>
                    <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters</p>
                  </CardContent>
                </Card>
              ) : (
                sortedJobs.map((job: Job) => (
                  <Card key={job.id} className="job-card opacity-0 transform translate-y-4">
                    <CardContent className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {job.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${job.matchPercentage >= 90 ? 'bg-green-100 text-green-800' : 
                              job.matchPercentage >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'} border-0
                          `}
                        >
                          {job.matchPercentage}% Match
                        </Badge>
                      </div>
                      
                      <div className="mt-1 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {job.company}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {job.location} ({job.distance})
                          </p>
                        </div>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {job.postedTime}
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="bg-primary bg-opacity-10 text-primary text-xs border-0">
                              {skill}
                            </Badge>
                          ))}
                          
                          {job.categories.map((category, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 text-xs border-0">
                              {category}
                            </Badge>
                          ))}
                          
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 text-xs border-0">
                            {job.employmentType}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm font-semibold text-gray-900">{job.salary}</p>
                        <Link href={`/jobs/${job.id}`}>
                          <Button size="sm">Apply Now</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {sortedJobs.length > 0 && (
                <div className="pt-4 flex justify-center">
                  <Button variant="outline">Load More Jobs</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobSearch;
