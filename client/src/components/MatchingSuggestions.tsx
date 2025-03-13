import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MatchingSuggestions() {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['/api/user/resume/suggestions'],
  });

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start">
                  <Skeleton className="h-6 w-6 rounded-full mr-3" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-6">Resume Optimization Suggestions</h3>
          
          <div className="space-y-4">
            {suggestions.map((suggestion: any) => (
              <div key={suggestion.id} className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {suggestion.type === 'warning' ? (
                    <AlertTriangle className="text-warning text-lg" />
                  ) : (
                    <CheckCircle className="text-secondary text-lg" />
                  )}
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button variant="link" className="text-primary text-sm font-medium flex items-center p-0">
              View all suggestions <i className="ri-arrow-right-line ml-1"></i>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
