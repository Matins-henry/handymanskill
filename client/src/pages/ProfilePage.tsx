import AppTabs from "@/components/AppTabs";
import ProfileSection from "@/components/ProfileSection";
import ResumeUploadSection from "@/components/ResumeUploadSection";
import MatchingSuggestions from "@/components/MatchingSuggestions";
import JobMatchesSection from "@/components/JobMatchesSection";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
  });

  const { data: resumeInfo, isLoading: resumeLoading } = useQuery({
    queryKey: ['/api/user/resume'],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AppTabs activeTab="profile" />
      
      {userLoading ? (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-10">
          <Skeleton className="h-32 w-full" />
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="ml-4 mb-2 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ProfileSection user={user} />
      )}
      
      {resumeLoading ? (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      ) : (
        <ResumeUploadSection resumeInfo={resumeInfo} />
      )}
      
      <MatchingSuggestions />
      <JobMatchesSection limit={3} showViewAll={true} />
    </div>
  );
}
