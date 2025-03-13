import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const JobDetails = () => {
  const { id } = useParams();
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: [`/api/jobs/${id}`],
  });
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-500">Loading job details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-500 mb-6">The job you're looking for may have been removed or doesn't exist.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Link>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
              <CardDescription className="mt-2 flex items-center">
                <Building className="h-4 w-4 mr-1 text-gray-400" />
                {job.company}
                <span className="mx-2">•</span>
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {job.location} ({job.distance})
              </CardDescription>
            </div>
            
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
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {job.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-primary bg-opacity-10 text-primary border-0">
                {skill}
              </Badge>
            ))}
            
            {job.categories.map((category: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 border-0">
                {category}
              </Badge>
            ))}
            
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-0">
              {job.employmentType}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Salary Range</div>
                <div className="font-medium">{job.salary}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Posted</div>
                <div className="font-medium">{job.postedTime}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Job Type</div>
                <div className="font-medium">{job.employmentType}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Start Date</div>
                <div className="font-medium">{job.startDate || "Immediate"}</div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Job Description</h3>
            <div className="text-gray-700 space-y-4">
              <p>{job.description}</p>
              
              {job.responsibilities && (
                <div>
                  <h4 className="font-medium mt-4 mb-2">Responsibilities:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.responsibilities.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {job.requirements && (
                <div>
                  <h4 className="font-medium mt-4 mb-2">Requirements:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.requirements.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {job.benefits && (
                <div>
                  <h4 className="font-medium mt-4 mb-2">Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.benefits.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Company Information</h3>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-2" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span>{job.fullAddress || job.location}</span>
              </div>
              {job.contactEmail && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <a href={`mailto:${job.contactEmail}`} className="text-primary hover:underline">
                    {job.contactEmail}
                  </a>
                </div>
              )}
              {job.contactPhone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <a href={`tel:${job.contactPhone}`} className="text-primary hover:underline">
                    {job.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center border-t p-6">
          <div className="text-sm text-gray-500">
            Job ID: {job.id}
          </div>
          <div className="flex space-x-4">
            <Button variant="outline">Save Job</Button>
            <Button>Apply Now</Button>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skills Match Analysis</CardTitle>
          <CardDescription>How your skills match with this job</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Match</span>
                <span className="text-sm font-medium">{job.matchPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${job.matchPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-3">Matching Skills</h4>
              <div className="space-y-2">
                {job.matchingSkills?.map((skill: { name: string, match: number }, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>{skill.name}</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-0">
                      {skill.match}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            {job.missingSkills?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Missing Skills</h4>
                <div className="space-y-2">
                  {job.missingSkills.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetails;
