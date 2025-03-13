import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Camera, User, MapPin, Mail, Phone, Calendar } from "lucide-react";
import { uploadResume } from "@/lib/resumeParser";

// Form schemas
const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160).optional(),
  location: z.string().min(2, {
    message: "Please enter a valid location.",
  }),
  phone: z.string().optional(),
  yearsOfExperience: z.string(),
});

const accountFormSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  newPassword: z.string().min(8, {
    message: "New password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Confirm password must be at least 8 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type AccountFormValues = z.infer<typeof accountFormSchema>;

const ProfilePage = () => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user profile data
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
  });
  
  // Default form values for profile
  const defaultProfileValues: Partial<ProfileFormValues> = {
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    phone: user?.phone || "",
    yearsOfExperience: user?.yearsOfExperience?.toString() || "0",
  };
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultProfileValues,
    mode: "onChange",
  });
  
  // Account form
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => {
      return apiRequest("PATCH", "/api/user/profile", values);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.message,
      });
    },
  });
  
  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Avatar update failed: ${errorText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update avatar",
        description: error.message,
      });
    },
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (values: AccountFormValues) => {
      return apiRequest("PATCH", "/api/user/password", {
        currentPassword: values.password,
        newPassword: values.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      accountForm.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update password",
        description: error.message,
      });
    },
  });
  
  // Resume upload mutation
  const uploadResumeMutation = useMutation({
    mutationFn: (file: File) => uploadResume(file),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Resume uploaded",
          description: "Your resume has been uploaded successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "There was an error uploading your resume.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    },
  });
  
  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle avatar upload
  const handleAvatarUpload = () => {
    if (avatarFile) {
      updateAvatarMutation.mutate(avatarFile);
    }
  };
  
  // Handle resume upload
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadResumeMutation.mutate(file);
    }
  };
  
  // On profile form submit
  const onProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  // On account form submit
  const onAccountSubmit = (values: AccountFormValues) => {
    updatePasswordMutation.mutate(values);
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-12 space-y-6">
        <div className="text-center py-12">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile sidebar */}
        <div className="md:w-1/3">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage 
                    src={avatarPreview || user?.avatar} 
                    alt={user?.username} 
                  />
                  <AvatarFallback className="text-xl">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              
              {avatarFile && (
                <Button 
                  size="sm" 
                  className="mb-4"
                  onClick={handleAvatarUpload}
                  disabled={updateAvatarMutation.isPending}
                >
                  {updateAvatarMutation.isPending ? "Uploading..." : "Save Profile Picture"}
                </Button>
              )}
              
              <h2 className="text-xl font-bold">{user?.username}</h2>
              <p className="text-gray-500 mt-1">{user?.title || "Handyman Professional"}</p>
              
              <div className="mt-4 space-y-2 text-left">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>Member since {user?.memberSince || "Recently"}</span>
                </div>
                {user?.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user?.yearsOfExperience && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{user.yearsOfExperience} years of experience</span>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="text-left">
                <h3 className="text-sm font-medium mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                  
                  {(!user?.skills || user.skills.length === 0) && (
                    <p className="text-sm text-gray-500">No skills added yet.</p>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="text-left">
                <h3 className="text-sm font-medium mb-2">Resume</h3>
                {user?.resume ? (
                  <div>
                    <p className="text-sm">{user.resume.filename}</p>
                    <div className="flex items-center mt-2">
                      <Button variant="outline" size="sm" className="mr-2">
                        View Resume
                      </Button>
                      <label htmlFor="resume-upload">
                        <Button variant="outline" size="sm" asChild>
                          <span>Update</span>
                        </Button>
                        <input
                          id="resume-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.docx"
                          onChange={handleResumeUpload}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">No resume uploaded yet.</p>
                    <label htmlFor="resume-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>Upload Resume</span>
                      </Button>
                      <input
                        id="resume-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.docx"
                        onChange={handleResumeUpload}
                      />
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Profile settings */}
        <div className="flex-1">
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information. This information will be displayed publicly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="City, State or Zip Code" />
                              </FormControl>
                              <FormDescription>
                                Your location will be used for job matching.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="yearsOfExperience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Experience</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select years of experience" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0">Less than 1 year</SelectItem>
                                  <SelectItem value="1">1 year</SelectItem>
                                  <SelectItem value="2">2 years</SelectItem>
                                  <SelectItem value="3">3 years</SelectItem>
                                  <SelectItem value="5">5+ years</SelectItem>
                                  <SelectItem value="10">10+ years</SelectItem>
                                  <SelectItem value="15">15+ years</SelectItem>
                                  <SelectItem value="20">20+ years</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Tell clients about yourself, your experience, and your expertise."
                                rows={4}
                              />
                            </FormControl>
                            <FormDescription>
                              Brief description for your profile. Maximum 160 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Update your account password and security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...accountForm}>
                    <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6">
                      <FormField
                        control={accountForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
