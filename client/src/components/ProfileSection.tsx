import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ProfileSectionProps {
  user: any;
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    title: user?.title || "",
    about: user?.about || ""
  });
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await apiRequest('PATCH', '/api/user/profile', formData);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setEditOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <section className="mb-10">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-6">
            <div className="h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user?.name || "Profile"} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="ml-4 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{user?.name || "Your Name"}</h2>
              <p className="text-gray-600">{user?.title || "Your Title"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {user?.skills?.map((skill: string) => (
              <span key={skill} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                {skill}
              </span>
            ))}
            {user?.skills?.length > 5 && (
              <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                +{user.skills.length - 5} more
              </span>
            )}
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">About Me</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditOpen(true)}
                className="text-primary text-sm font-medium flex items-center"
              >
                <Edit className="mr-1 h-4 w-4" /> Edit
              </Button>
            </div>
            <p className="mt-2 text-gray-600">
              {user?.about || "Add information about yourself to help employers get to know you."}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">About Me</Label>
              <Textarea 
                id="about" 
                value={formData.about} 
                onChange={(e) => setFormData({...formData, about: e.target.value})}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
