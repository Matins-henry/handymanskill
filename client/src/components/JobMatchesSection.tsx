import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import JobCard from "@/components/JobCard";
import { Skeleton } from "@/components/ui/skeleton";

interface JobMatchesSectionProps {
  limit?: number;
  showViewAll?: boolean;
  searchTerm?: string;
  distance?: number;
  skills?: string[];
}

export default function JobMatchesSection({ 
  limit = 10, 
  showViewAll = false,
  searchTerm = '',
  distance = 0,
  skills = []
}: JobMatchesSectionProps) {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs/matches', { searchTerm, distance, skills }],
  });
  
  const displayJobs = limit ? jobs?.slice(0, limit) : jobs;

  if (isLoading) {
    return (
      <section id="job-matches-section">
        {showViewAll && (
          <div className="border-b border-gray-200 mb-6 pb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Top Job Matches</h2>
            <Link href="/job-matches">
              <Button variant="link" className="text-primary text-sm font-medium flex items-center p-0">
                View all matches <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </div>
                
                <div className="mb-4 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                
                <div className="mb-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded" />
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-6 w-24 rounded" />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!displayJobs || displayJobs.length === 0) {
    return (
      <section id="job-matches-section">
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No job matches found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or upload a resume to find matching jobs</p>
          <Link href="/">
            <Button>Update Your Profile</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="job-matches-section">
      {showViewAll && (
        <div className="border-b border-gray-200 mb-6 pb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Top Job Matches</h2>
          <Link href="/job-matches">
            <Button variant="link" className="text-primary text-sm font-medium flex items-center p-0">
              View all matches <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayJobs.map((job: any) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
